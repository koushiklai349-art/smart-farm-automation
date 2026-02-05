// dashboard/js/recovery/recovery.engine.js

import { releaseDevice } from "./device.quarantine.js";
import { markRecoveryStart,markRecoveryEnd } from "./recovery.state.js";
import { checkPredictiveRecoveryRisk } from "./recovery.predictive.alert.js";
import { recordActionOutcome } from "../learning/action.outcome.stats.js";
import { logAutoActionAudit } from "../audit/auto.action.audit.js";
import { checkRecoverySLABreach } from "./recovery.sla.monitor.js";
import { checkRecoverySLATrend } from "./recovery.sla.trend.js";
import { resolvePlaybookOutcome } from "./playbook/recovery.playbook.outcome.store.js";

export function onRecoveryStart(deviceId) {
  markRecoveryStart(deviceId);

  logAutoActionAudit({
    deviceId,
    stage: "RECOVERY_START",
    action: "RECOVERY",
    reason: "FAILURE_DETECTED"
  });
}

/**
 * Device back online → recovery success
 */
export function onDeviceOnline(deviceId) {
  // 🔚 End recovery state
  markRecoveryEnd(deviceId);

  // 🔓 Release quarantine
  releaseDevice(deviceId);

  // 🧠 Feed learning system (recovery success)
  recordActionOutcome({
    deviceId,
    action: "RECOVERY",
    outcome: "SUCCESS"
  });

  // 📜 Audit visibility
  logAutoActionAudit({
    deviceId,
    stage: "RECOVERY_SUCCESS",
    action: "RECOVERY",
    reason: "DEVICE_ONLINE"
  });

  resolvePlaybookOutcome({
  action: "RETRY_DEVICE",
  deviceId,
  status: "SUCCESS",
  meta: { reason: "Device recovered" }
});

resolvePlaybookOutcome({
  action: "RELEASE_DEVICE",
  deviceId,
  status: "SUCCESS",
  meta: { reason: "Recovered after release" }
});

  
   // 🔒 TASK-96 STEP-5: safety guard (never break recovery)
  try {
    // 🔮 predictive recovery check
    checkPredictiveRecoveryRisk();

    // ⏱ SLA breach
    checkRecoverySLABreach();

    // 📈 SLA trend escalation
    checkRecoverySLATrend();
  } catch (e) {
    console.warn("Recovery monitor error:", e);
  }


}
