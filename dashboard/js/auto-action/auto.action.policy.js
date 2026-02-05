// dashboard/js/auto-action/auto.action.policy.js

import { getActionRisk } from "../learning/action.risk.engine.js";

/**
 * অটো action নেওয়া যাবে কিনা – risk-aware সিদ্ধান্ত
 */
export function evaluateAutoActionPolicy(context) {
  const {
    deviceId,
    action,
    isQuarantined,
    healthScore,
    isPredictive,
    predictiveRisk
  } = context;

  // ❌ Quarantine থাকলে কিছুই করা যাবে না
  if (isQuarantined) {
    return block("DEVICE_QUARANTINED");
  }

  // ❌ Health খুব খারাপ হলে অটো action না
  if (healthScore < 40) {
    return block("LOW_HEALTH_SCORE");
  }

  // 🧠 Learning-based risk check
  if (deviceId && action) {
    const risk = getActionRisk(deviceId, action);

    if (risk) {
      if (risk.level === "HIGH") {
        return block("ACTION_RISK_HIGH", risk);
      }

      if (risk.level === "MEDIUM" && risk.score > 0.45) {
        return block("ACTION_RISK_MEDIUM", risk);
      }
    }
  }

  // ⚠️ Predictive alert হলে predictive risk check
  if (isPredictive) {
    if (predictiveRisk < 0.6) {
      return block("PREDICTIVE_RISK_TOO_LOW", {
        predictiveRisk
      });
    }
  }

  // ✅ সব ঠিক থাকলে allow
  return allow();
}

/* ---------- helpers ---------- */

function allow() {
  return {
    allowed: true,
    reason: "POLICY_OK"
  };
}

function block(reason, risk) {
  return {
    allowed: false,
    reason,
    risk // explainability জন্য
  };
}
