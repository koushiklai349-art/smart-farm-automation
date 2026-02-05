// js/governance/governance.explain.js

export function explainGovernance(entry) {
  return `
Decision: ${entry.decisionType}
Device: ${entry.deviceId}
Operator: ${entry.operatorId}
Trust Level: ${entry.trust}
Risk Level: ${entry.risk}
Time: ${new Date(entry.at).toLocaleString()}
`.trim();
}
