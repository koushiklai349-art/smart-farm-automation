import { auditCommand } from "../audit/command.audit.js";
import { metricsStore } from "../audit/metrics.store.js";
import { recordFailure, clearFailures } from "../recovery/failure.counter.js";
import { quarantineDevice, isQuarantined } from "../recovery/device.quarantine.js";
import { canExecuteCommand } from "./command.guard.js";
import { auditStore } from "../audit/audit.store.js";
import { allowCommand } from "./command.rate.limiter.js";
import { recordFailureCorrelation } from "../failure/failure.correlation.store.js";


const COMMAND_TIMEOUT = 8000;
const MAX_RETRY = 3;

export function executeCommand(cmd, sendFn) {
  // 🔒 HARD BLOCK: system locked
  if (!canExecuteCommand()) {
    auditStore.add({
      type: "COMMAND_BLOCKED",
      level: "WARN",
      commandId: cmd?.id,
      deviceId: cmd?.deviceId,
      reason: "SYSTEM_HEALTH_CRITICAL",
      timestamp: Date.now()
    });
    return; // ⛔ STOP execution completely
  }
  // rate limit check
   if (!allowCommand(cmd)) {
  auditStore.add({
    type: "COMMAND_RATE_LIMITED",
    level: "WARN",
    commandId: cmd?.id,
    deviceId: cmd?.deviceId,
    timestamp: Date.now()
  });
  return; // ⛔ stop execution
}

    // 🛑 BLOCK command if device is quarantined
  if (isQuarantined(cmd.deviceId)) {
    console.warn("Command blocked (quarantined):", cmd.deviceId);
    return;
  }

  auditCommand(cmd, "SENT");
  metricsStore.inc("sent");

  cmd.status = "SENT";

  const timer = setTimeout(() => {
    handleFailure(cmd, "timeout", sendFn);
  }, COMMAND_TIMEOUT);

sendFn(cmd)
  .then(() => {
    // ✅ command only SENT successfully
    // ❌ outcome (SUCCESS / FAILED) decided by ACK listener
    clearTimeout(timer);
  })
  .catch(err => {
    clearTimeout(timer);
    handleFailure(cmd, "failed", sendFn, err);
  });

}

function handleFailure(cmd, reason, sendFn, err) {
  cmd.retryCount++;
  const fails = recordFailure(cmd.deviceId);

  if (fails >= 5) {
    quarantineDevice(cmd.deviceId);
  }

  auditCommand(cmd, reason.toUpperCase(), { err });
  metricsStore.inc(reason);
 recordFailureCorrelation({
  type: "COMMAND_FAILURE",
  deviceId: cmd.deviceId,
  commandId: cmd.id,
  reason,
  retryCount: cmd.retryCount
});

  
  if (cmd.retryCount <= MAX_RETRY) {
    setTimeout(() => executeCommand(cmd, sendFn), 2000);
  } else {
    cmd.status = "FAILED";
  }
}
