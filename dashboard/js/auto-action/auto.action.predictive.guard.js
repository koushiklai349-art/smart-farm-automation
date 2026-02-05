import { predictStability } from "../system/system.stability.predictor.js";
import { isOperatorOverrideActive } from "../system/operator.override.state.js";
import { getGovernancePolicy } from "../system/governance.policy.store.js";

export function passPredictiveGuard() {
  const forecast = predictStability();
  if (!forecast) {
    return { allowed: true };
  }

  // 🧑‍💼 TASK-122: operator override
  if (isOperatorOverrideActive()) {
    return {
      allowed: true,
      override: true
    };
  }

  // 🛠 TASK-131: policy-aware sensitivity
  const policy = getGovernancePolicy();
  const sensitivity =
    policy.autoAction?.predictiveBlockSensitivity || "MEDIUM";

  // 🔴 HIGH sensitivity → block HIGH + MEDIUM
  if (
    sensitivity === "HIGH" &&
    (forecast.risk === "high" || forecast.risk === "medium")
  ) {
    return {
      allowed: false,
      reason: "PREDICTED_CRITICAL_RISK",
      meta: {
        predicted: forecast.predicted,
        slope: forecast.slope,
        sensitivity
      }
    };
  }

  // 🟡 MEDIUM sensitivity → block only HIGH
  if (
    sensitivity === "MEDIUM" &&
    forecast.risk === "high"
  ) {
    return {
      allowed: false,
      reason: "PREDICTED_CRITICAL_RISK",
      meta: {
        predicted: forecast.predicted,
        slope: forecast.slope,
        sensitivity
      }
    };
  }

  // 🟢 LOW sensitivity → predictive block disabled
  return { allowed: true };
}
