// dashboard/js/auto-action/auto.action.engine.js

import { getActionContext } from "./auto.action.context.js";
import { evaluateAutoActionPolicy } from "./auto.action.policy.js";
import { passAutoActionGuard } from "./auto.action.guard.js";
import { registerEngine, beat } from "../system/engine.heartbeat.js";
import { createCommand } from "../command/command.factory.js";
import { dispatchCommand } from "../command/command.dispatcher.js";
import { alertManager } from "../core/alert/alert.manager.js";
import { logAutoActionAudit } from "../audit/auto.action.audit.js";
import { isAutoActionEnabled } from "../devices/device.autoaction.store.js";
import { isRecoveryInProgress } from "../recovery/recovery.state.js";
import { isDryRunMode } from "../system/engine.guard.js";
import { evaluateDecision } from "../governance/governance.engine.js";
import { DECISION_TYPE } from "../governance/governance.types.js";


// 🔒 Phase-13.2-C: simple defer helper
function deferAutoAction({ deviceId, action, alert, reason, meta }) {
  logAutoActionAudit({
    deviceId,
    stage: "DEFERRED",
    action,
    reason,
    alert,
    meta,
    deferredAt: Date.now()
  });

  // ⚠️ future: scheduler / queue hook here
  // এখন শুধু audit + skip execution
}

let autoActionStarted = false;

/**
 * Auto Action Engine initialize
 */
export function initAutoActionEngine() {
 if (autoActionStarted) {
  console.warn("[AUTO-ACTION] Restarting engine");
  
}
autoActionStarted = true;

    // 🫀 TASK-98: register heartbeat
  registerEngine("auto-action", {
  interval: 5000,
  startFn: initAutoActionEngine
});


  setInterval(() => {
   beat("auto-action");
  }, 3000);

}

/**
 * Alert এলে এখানে আসবে
 */
export function handleAutoActionAlert(alert) {
  const deviceId = alert.deviceId;
  if (!deviceId) return;


  // 🔒 Recovery চললে auto action বন্ধ
  if (isRecoveryInProgress()) {
    logAutoActionAudit({
      deviceId,
      stage: "BLOCKED",
      reason: "RECOVERY_IN_PROGRESS",
      alert
    });

    evaluateDecision({
    decisionType: DECISION_TYPE.BLOCKED,
    deviceId,
    context: { reason: "RECOVERY_IN_PROGRESS" }
    });

    return;
  }

  if (!isAutoActionEnabled(deviceId)) {
    logAutoActionAudit({
      deviceId,
      stage: "BLOCKED",
      reason: "AUTO_ACTION_DISABLED",
      alert
    });

    evaluateDecision({
    decisionType: DECISION_TYPE.BLOCKED,
    deviceId,
    context: { reason: "AUTO_ACTION_DISABLED" }
    });

    return;
  }

  // 1️⃣ Context
  const context = getActionContext(deviceId, alert);

  // 2️⃣ Policy
  const policyResult = evaluateAutoActionPolicy(context);
  if (!policyResult.allowed) {
    logAutoActionAudit({
      deviceId,
      stage: "POLICY_REJECTED",
      alert,
      policyResult
    });

    evaluateDecision({
     decisionType: DECISION_TYPE.BLOCKED,
     deviceId,
     context: { reason: "POLICY_REJECTED" }
    });

    return;
  }

  // 3️⃣ Decide action type
  const actionType = decideAction(alert);
  if (!actionType) {
    logAutoActionAudit({
      deviceId,
      stage: "NO_ACTION_MATCH",
      alert
    });

    evaluateDecision({
    decisionType: DECISION_TYPE.BLOCKED,
    deviceId,
    context: { reason: "NO_ACTION_MATCH" }
    });

    return;
  }

  // 4️⃣ Guard
 const guardResult = passAutoActionGuard(deviceId, actionType, alert);

  if (!guardResult.allowed) {
  // ⏳ Phase-13.2-C: cost-aware defer
  if (
  guardResult.reason === "PEAK_HOUR_HIGH_COST" ||
  guardResult.reason === "LOW_ACTION_CONFIDENCE"
  ) {

    deferAutoAction({
      deviceId,
      action: actionType,
      alert,
      reason: guardResult.reason,
      meta: guardResult.meta
    });
    return;
  }

  // ❌ hard block (non-deferrable)
  logAutoActionAudit({
    deviceId,
    stage: "GUARD_BLOCKED",
    action: actionType,
    alert,
    guardResult
  });

  evaluateDecision({
  decisionType: DECISION_TYPE.BLOCKED,
  deviceId,
  context: { reason: guardResult.reason }
  });

  return;
}


  // 🟢 FINAL DECISION (Explainable)
  logAutoActionAudit({
  deviceId,
  stage: "ACTION_ALLOWED",
  action: actionType,
  alert,
  context,
  policyResult,
  guardResult
});

evaluateDecision({
  decisionType: DECISION_TYPE.AUTO_ACTION,
  deviceId,
  context: {
    action: actionType,
    policyResult,
    guardResult
  }
});


  // 5️⃣ Command create
const command = createCommand({
  deviceId,
  action: actionType,
  source: "AUTO_ACTION_ENGINE"
});

// 🔒 Phase-13.6-B: dry-run execution skip
if (isDryRunMode()) {
  logAutoActionAudit({
    deviceId,
    stage: "SIMULATED",
    action: actionType,
    alert,
    context,
    policyResult,
    guardResult,
    reason: "DRY_RUN_MODE"
  });

   evaluateDecision({
    decisionType: DECISION_TYPE.BLOCKED,
    deviceId,
    context: { reason: "DRY_RUN_MODE" }
  });

  return; // 🚫 no real dispatch
}

// ▶️ Real execution
dispatchCommand(command);
}

/**
 * Alert দেখে কোন action হবে
 */
function decideAction(alert) {
  switch (alert.code) {
    case "TEMP_HIGH":
      return "COOLING_ON";

    case "TEMP_LOW":
      return "HEATER_ON";

    case "HUMIDITY_LOW":
      return "HUMIDIFIER_ON";

    case "WATER_LEVEL_LOW":
      return "WATER_PUMP_ON";

    default:
      return null;
  }
}
