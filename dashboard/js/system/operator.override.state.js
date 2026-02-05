// dashboard/js/system/operator.override.state.js
import { addAuditEntry } from "../audit/audit.history.js";
import { calculateOperatorTrustScore } from "./operator.trust.engine.js";
import { getGovernancePolicy } from "./governance.policy.store.js";
import { evaluateDecision } from "../governance/governance.engine.js";
import { DECISION_TYPE } from "../governance/governance.types.js";

function getMaxOverrideDurationByTrust() {
  const { score } = calculateOperatorTrustScore();
  const policy = getGovernancePolicy();

  const minTrust =
    policy.override?.minTrustForLongOverride ?? 80;

  const lowTrustMinutes =
    policy.override?.maxOverrideMinutesLowTrust ?? 2;

  // 🟢 High trust → long override
  if (score >= minTrust) {
    return 20 * 60 * 1000; // 20 min
  }

  // 🟠 Medium trust
  if (score >= 40) {
    return 5 * 60 * 1000; // 5 min
  }

  // 🔴 Low trust → policy limited
  return lowTrustMinutes * 60 * 1000;
}



let overrideUntil = 0;
let overrideReason = null;

const DEFAULT_OVERRIDE_MS = 10 * 60 * 1000; // 10 min

export function enableOperatorOverride(
  requestedDurationMs = DEFAULT_OVERRIDE_MS,
  reason = "Manual operator override"
) {
  const now = Date.now();
  const maxAllowed = getMaxOverrideDurationByTrust();
  const finalDuration = Math.min(requestedDurationMs, maxAllowed);

  overrideUntil = now + finalDuration;
  overrideReason = reason;

  addAuditEntry({
    type: "OPERATOR_OVERRIDE",
    action: "ENABLE",
    reason,
    requestedDurationMs,
    durationMs: finalDuration,
    startedAt: now,
    source: "OPERATOR"
  });

  evaluateDecision({
  decisionType: DECISION_TYPE.MANUAL_OVERRIDE,
  deviceId: "SYSTEM",
  operatorId: "OPERATOR",
  context: {
    reason,
    durationMs: finalDuration
  }
});

}

export function disableOperatorOverride() {
  const now = Date.now();

  addAuditEntry({
    type: "OPERATOR_OVERRIDE",
    action: "DISABLE",
    endedAt: now,
    source: "OPERATOR"
  });
  
  evaluateDecision({
  decisionType: DECISION_TYPE.BLOCKED,
  deviceId: "SYSTEM",
  operatorId: "SYSTEM",
  context: { reason: "OVERRIDE_ENDED" }
  });

  overrideUntil = 0;
  overrideReason = null;
}


export function isOperatorOverrideActive() {
  return Date.now() < overrideUntil;
}

export function getOperatorOverrideInfo() {
  if (!isOperatorOverrideActive()) return null;

  return {
    until: overrideUntil,
    reason: overrideReason
  };
}
// 🕒 auto-expire watcher
setInterval(() => {
  if (overrideUntil && Date.now() > overrideUntil) {
    addAuditEntry({
      type: "OPERATOR_OVERRIDE",
      action: "EXPIRED",
      endedAt: Date.now(),
      source: "SYSTEM"
    });

    overrideUntil = 0;
    overrideReason = null;
  }
}, 1000);

