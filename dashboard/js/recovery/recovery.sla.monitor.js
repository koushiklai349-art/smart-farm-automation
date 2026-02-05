let lastSLACheckAt = 0;
const SLA_ALERT_COOLDOWN_MS = 30 * 1000; // 30s
import { markSLABreachTime } from "./recovery.deescalation.monitor.js";
import { getRecoveryDurations } from "./recovery.timeline.store.js";
import { raiseAlert } from "../core/alert/alert.manager.js";
import { incrementRecoverySLA }from "../audit/metrics.store.js";
import {recordSLAResult} from "./recovery.sla.state.js";
import { recordSLATimelineEvent } from "./recovery.timeline.store.js";
import { setSystemMode, SYSTEM_MODE } from "./recovery.state.js";

// 🆕 TASK-113: warning SLA escalation buffer
const warningSLABuffer = [];
const WARNING_WINDOW_MS = 10 * 60 * 1000; // 10 min
const WARNING_THRESHOLD = 3;

const SLA_WARNING_MS = 3 * 60 * 1000;   // 3 min
const SLA_CRITICAL_MS = 6 * 60 * 1000;  // 6 min

export function checkRecoverySLABreach() {
  const durations = getRecoveryDurations();
  const now = Date.now();
  if (now - lastSLACheckAt < SLA_ALERT_COOLDOWN_MS) return;
  lastSLACheckAt = now;

  if (!durations.length) return;

  // latest recovery only
 const latest = durations.reduce((a, b) =>
  a.recoveredAt > b.recoveredAt ? a : b
);

  // 🔒 prevent duplicate SLA alert for same recovery
  if (latest.slaAlerted) return;

  if (!latest?.durationMs) return;

 if (latest.durationMs >= SLA_CRITICAL_MS) {
  recordSLAResult("critical");
  incrementRecoverySLA("critical");

latest.slaAlerted = true;
   // 🆕 TASK-111: timeline event
  recordSLATimelineEvent({
    level: "critical",
    deviceId: latest.deviceId,
    durationMs: latest.durationMs
  });
// 🆕 TASK-113: immediate critical escalation
setSystemMode(
  SYSTEM_MODE.CRITICAL,
  "SLA_CRITICAL_BREACH"
);


  raiseAlert(
    {
      code: "RECOVERY_SLA_BREACH_CRITICAL",
      severity: "critical",
      message: "Recovery SLA breached (CRITICAL)"
    },
    {
      deviceId: latest.deviceId,
      durationMs: latest.durationMs
    }
  );
   markSLABreachTime();
  return;
 

}

if (latest.durationMs >= SLA_WARNING_MS) {
  recordSLAResult("warning");
  incrementRecoverySLA("warning");

  latest.slaAlerted = true;
  recordSLATimelineEvent({
  level: "warning",
  deviceId: latest.deviceId,
  durationMs: latest.durationMs
 });
 // 🆕 TASK-113: track warning SLA breaches
warningSLABuffer.push(Date.now());

// prune old warnings
const cutoff = Date.now() - WARNING_WINDOW_MS;
while (warningSLABuffer.length && warningSLABuffer[0] < cutoff) {
  warningSLABuffer.shift();
}

// escalate if threshold crossed
if (warningSLABuffer.length >= WARNING_THRESHOLD) {
  setSystemMode(
  SYSTEM_MODE.DEGRADED,
  "SLA_WARNING_THRESHOLD"
);

}

  raiseAlert(
    {
      code: "RECOVERY_SLA_BREACH_WARNING",
      severity: "warning",
      message: "Recovery SLA breached (WARNING)"
    },
    {
      deviceId: latest.deviceId,
      durationMs: latest.durationMs
    }
  );
   markSLABreachTime();
  return;
  

}

recordSLAResult("ok");
incrementRecoverySLA("ok");


}
