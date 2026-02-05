// alert.governance.mapper.js

export function mapAlertToGovernanceImpact(alert) {
  const impacts = [];

  switch (alert.code) {
    case "DEVICE_OFFLINE":
      impacts.push({
        type: "TRUST_DECREASE",
        weight: 10
      });
      break;

    case "COMMAND_HARD_FAIL":
      impacts.push({
        type: "TRUST_DECREASE",
        weight: 15
      });
      break;

    case "RECOVERY_TOO_SLOW":
      impacts.push({
        type: "POLICY_REVIEW",
        weight: 1
      });
      break;

    case "HEALTH_FAST_DROP":
      impacts.push({
        type: "RISK_INCREASE",
        weight: 5
      });
      break;
  }

  return impacts;
}
