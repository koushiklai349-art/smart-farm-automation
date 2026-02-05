import { predictStability } from "./system.stability.predictor.js";
import { getGovernancePolicy } from "./governance.policy.store.js";
import { calculateOperatorTrustScore } from "./operator.trust.engine.js";

/**
 * Simulate system decision WITHOUT executing anything
 */
export function simulateSystemDecision(options = {}) {
  const {
    overrideActive = false,
    mockRisk = null // "low" | "medium" | "high"
  } = options;

  const policy = getGovernancePolicy();
  const { score: trustScore } = calculateOperatorTrustScore();

  const forecast = predictStability();

  const risk =
    mockRisk ||
    forecast?.risk ||
    "unknown";

  // 🧑‍💼 Simulated override
  if (overrideActive) {
    return {
      decision: "ALLOW",
      reason: "OPERATOR_OVERRIDE",
      meta: {
        trustScore,
        policy
      }
    };
  }

  // 🛠 Policy-aware predictive logic
  const sensitivity =
    policy.autoAction?.predictiveBlockSensitivity || "MEDIUM";

  if (
    sensitivity === "HIGH" &&
    (risk === "high" || risk === "medium")
  ) {
    return {
      decision: "BLOCK",
      reason: "PREDICTED_RISK_HIGH_SENSITIVITY",
      meta: { risk, sensitivity }
    };
  }

  if (
    sensitivity === "MEDIUM" &&
    risk === "high"
  ) {
    return {
      decision: "BLOCK",
      reason: "PREDICTED_CRITICAL_RISK",
      meta: { risk, sensitivity }
    };
  }

  return {
    decision: "ALLOW",
    reason: "SAFE_FORECAST",
    meta: { risk, sensitivity }
  };
}
