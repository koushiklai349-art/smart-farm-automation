import { predictStability } from "./system.stability.predictor.js";

/**
 * Simulate decision under a given policy
 */
function simulateWithPolicy({ policy, mockRisk }) {
  const forecast = predictStability();
  const risk = mockRisk || forecast?.risk || "unknown";

  const sensitivity =
    policy.autoAction?.predictiveBlockSensitivity || "MEDIUM";

  if (
    sensitivity === "HIGH" &&
    (risk === "high" || risk === "medium")
  ) {
    return { decision: "BLOCK", reason: "HIGH_SENSITIVITY", risk };
  }

  if (
    sensitivity === "MEDIUM" &&
    risk === "high"
  ) {
    return { decision: "BLOCK", reason: "MEDIUM_SENSITIVITY", risk };
  }

  return { decision: "ALLOW", reason: "SAFE", risk };
}

/**
 * Compare two policies
 */
export function comparePolicies({
  policyA,
  policyB,
  mockRisk = null
}) {
  return {
    policyA: simulateWithPolicy({ policy: policyA, mockRisk }),
    policyB: simulateWithPolicy({ policy: policyB, mockRisk })
  };
}
