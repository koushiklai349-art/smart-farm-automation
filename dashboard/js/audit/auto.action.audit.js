// dashboard/js/audit/auto.action.audit.js

import { getAuditHistory } from "./audit.history.js";
import { auditStore } from "./audit.store.js";


// 🔒 Phase-13.5-A helpers: explain payload
function buildExplainPayload({ stage, policyResult, guardResult, reason, context }) {
  const reasons = [];

  if (reason) reasons.push(reason);
  if (policyResult?.reason) reasons.push(`POLICY:${policyResult.reason}`);
  if (guardResult?.reason) reasons.push(`GUARD:${guardResult.reason}`);

  let decision = "BLOCKED";
  if (stage === "ACTION_ALLOWED") decision = "ALLOWED";
  else if (stage === "DEFERRED") decision = "DEFERRED";

  return {
    decision,
    reasons,
    confidence: guardResult?.meta?.confidence || null,
    contextSummary: context
      ? {
          isNight: context.isNight,
          isPeakHour: context.isPeakHour,
          energyCostLevel: context.energyCostLevel,
          sharedLoad: context.sharedLoad
        }
      : null
  };
}

/**
 * Auto Action audit entry (Explainable)
 */
export function logAutoActionAudit({
  deviceId,
  stage,
  action,
  reason,
  alert,
  policyResult,
  guardResult,
  context,
  ruleExplain // 🆕
}) {

  if (!deviceId || !stage) return;
  
    const explain = buildExplainPayload({
    stage,
    policyResult,
    guardResult,
    reason,
    context
  });
  if (ruleExplain) {
  explain.rule = ruleExplain;
}

auditStore.log({
  type: "AUTO_ACTION",

  deviceId,
  stage,
  action: action || null,

  alertCode: alert?.code || "UNKNOWN",
  alertType: alert?.type || "UNKNOWN",

  policyAllowed: policyResult?.allowed,
  policyReason: policyResult?.reason,

  guardAllowed: guardResult?.allowed,
  guardReason: guardResult?.reason,

  reason,

  // 🔒 Phase-13.5-A: explainable payload
  explain,

  at: new Date().toISOString()
});


}
