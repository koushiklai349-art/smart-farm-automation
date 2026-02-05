// dashboard/js/auto-action/auto.action.guard.js

import { isEngineLocked } from "../system/engine.guard.js";
import { isDeviceQuarantined } from "../recovery/device.quarantine.js";
import { commandRateLimiter } from "../command/command.rate.limiter.js";
import { applyRiskDecay } from "../learning/risk.decay.engine.js";
import { getActionRisk } from "../learning/action.risk.engine.js";
import { getDeviceConfidence } from "../devices/device.manager.js";
import { getActionContext } from "./auto.action.context.js";
import { getSystemMode,SYSTEM_MODE} from "../recovery/recovery.state.js";
import { passPredictiveGuard } from "./auto.action.predictive.guard.js";

/**
 * Final safety check – action চালানো যাবে কিনা
 */
export function passAutoActionGuard(deviceId, actionType, alert) {

  // 🛑 Defensive: invalid input
  if (!deviceId || !actionType) {
    return block("INVALID_ACTION_CONTEXT");
  }

  // ❌ System global lock
  if (isEngineLocked()) {
    return block("ENGINE_LOCKED");
  }
    // 🚨 System authority guard (TASK-103)
  const systemMode = getSystemMode();
  if (systemMode !== SYSTEM_MODE.STABLE) {
    return block("SYSTEM_NOT_STABLE", {
      systemMode
    });
  }

    // 🧠 Phase-13.1-B: context snapshot
  const context = getActionContext(deviceId, alert);


  // ❌ Device quarantine
  if (isDeviceQuarantined(deviceId)) {
    return block("DEVICE_QUARANTINED");
  }
   // 🌙 Night-time safety: avoid risky automation
  if (
    context.isNight &&
    actionType === "ACTUATOR_ON" &&
    context.healthScore < 50
  ) {
    return block("NIGHT_LOW_HEALTH", {
      healthScore: context.healthScore
    });
  }

  // 🛡 Device confidence safety (Phase-8)
  const confidence = getDeviceConfidence(deviceId);
  if (confidence && confidence.level === "LOW") {
    return block("LOW_DEVICE_CONFIDENCE", confidence);
  }
   
    // 🔥 Recent instability guard
  if (context.hasFailureBurst && context.isPredictive) {
    return block("FAILURE_BURST_CONTEXT", {
      recentFailures: context.recentFailures
    });
  }

  // 🧠 Risk-aware guard (TASK-48 + TASK-49)
  const risk = getActionRisk(deviceId, actionType);
  if (risk) {
    const decayed = applyRiskDecay(risk);

    // এখনো risky হলে auto action block
    if (
      decayed.level === "HIGH" &&
      decayed.effectiveFailureRate >= 0.3
    ) {
      return block("ACTION_HIGH_RISK", decayed);
    }
  }
    // 🧠 Phase-13.4-B: confidence-aware soft guard
  if (risk && risk.confidence === "LOW") {
    return block("LOW_ACTION_CONFIDENCE", {
      confidence: risk.confidence,
      reason: risk.reason,
      score: risk.score
    });
  }

    // ⚖️ High load precaution
  if (context.loadHint === "HIGH") {
    return block("DEVICE_UNDER_HIGH_LOAD");
  }
   // 💸 Phase-13.2-B: cost-aware soft guard
  if (
    context.isPeakHour &&
    context.energyCostLevel === "HIGH" &&
    isEnergyHeavyAction(actionType)
  ) {
    return block("PEAK_HOUR_HIGH_COST", {
      energyCostLevel: context.energyCostLevel,
      isPeakHour: context.isPeakHour
    });
  }
   // 🧠 Phase-13.3-B: shared resource protection
if (
  context.sharedLoad === "HIGH" &&
  isEnergyHeavyAction(actionType)
) {
  return block("SHARED_RESOURCE_BUSY", {
    sharedLoad: context.sharedLoad,
    activeResources: context.activeResources
  });
}
    // 🔮 TASK-120: predictive stability guard
  const predictive = passPredictiveGuard();
  if (!predictive.allowed) {
    return block(predictive.reason, predictive.meta);
  }

  // ❌ Rapid repeat command
  if (!commandRateLimiter.allow(deviceId, actionType)) {
    return block("RATE_LIMIT_BLOCKED");
  }

  // ✅ সব সেফ
  return allow();
}
function isEnergyHeavyAction(actionType) {
  return [
    "WATER_PUMP_ON",
    "HEATER_ON",
    "COOLING_ON"
  ].includes(actionType);
}

/* ---------- helpers ---------- */

function allow() {
  return {
    allowed: true,
    reason: "GUARD_OK"
  };
}

function block(reason, meta) {
  return {
    allowed: false,
    reason,
    meta
  };
}
