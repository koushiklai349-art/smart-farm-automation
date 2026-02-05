// js/governance/governance.engine.js

import { DECISION_TYPE,TRUST_LEVEL,GOVERNANCE_RISK } from "./governance.types.js";
import { governanceStore } from "./governance.store.js";
import { logGovernance } from "./governance.store.js";
import { adjustTrust } from "../health/trust.store.js";

export function evaluateDecision({
  decisionType,
  deviceId,
  operatorId = "SYSTEM",
  context = {},
}) {
  // simple, explainable heuristics
  let trust = TRUST_LEVEL.MEDIUM;
  let risk = GOVERNANCE_RISK.MEDIUM;

  if (decisionType === DECISION_TYPE.AUTO_ACTION) {
    trust = TRUST_LEVEL.HIGH;
    risk = GOVERNANCE_RISK.LOW;
  }

  if (decisionType === DECISION_TYPE.MANUAL_OVERRIDE) {
    trust = TRUST_LEVEL.MEDIUM;
    risk = GOVERNANCE_RISK.MEDIUM;
  }

  if (decisionType === DECISION_TYPE.BLOCKED) {
    trust = TRUST_LEVEL.LOW;
    risk = GOVERNANCE_RISK.HIGH;
  }

  const entry = {
    at: Date.now(),
    decisionType,
    deviceId,
    operatorId,
    trust,
    risk,
    context,
  };

  logGovernance(entry);
  return entry;
}

export function applyGovernanceImpact({
  
  type,
  weight,
  alertCode,
  deviceId,
  at
}) {
  adjustTrust(deviceId || "SYSTEM", weight);

  governanceStore.recordImpact({
    type,
    weight,
    source: "ALERT",
    alertCode,
    deviceId,
    at
  });
}
