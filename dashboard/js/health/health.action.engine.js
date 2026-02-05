import { enterSafeState } from "../core/failure/safe-state.manager.js";
import { auditStore } from "../audit/audit.store.js";
import { lockCommands, unlockCommands } from "../command/command.guard.js";
import { startAutoRecovery, stopAutoRecovery } from "../recovery/auto.recovery.engine.js";


export function onHealthChange(current, previous) {
  if (current === "critical") {
    handleCritical();
  }

  if (previous === "critical" && current === "ok") {
    handleRecovery();
  }
}

function handleCritical() {
  lockCommands();

  enterSafeState("SYSTEM_HEALTH_CRITICAL");

  auditStore.add({
  type: "SYSTEM",
  level: "CRITICAL",
  message: "System entered CRITICAL health state",
  timestamp: Date.now()
});
 startAutoRecovery(
  () => {
    // simple health probe (extend later)
    return true; // mock: assume recovered
  },
  () => {
    // recovery success
    onHealthChange("ok", "critical");
  }
);

}

function handleRecovery() {
  unlockCommands();

  auditStore.add({
  type: "SYSTEM",
  level: "INFO",
  message: "System recovered from CRITICAL health state",
  timestamp: Date.now()
});
stopAutoRecovery();
}
