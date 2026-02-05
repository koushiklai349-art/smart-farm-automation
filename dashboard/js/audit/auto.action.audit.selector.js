// dashboard/js/audit/auto.action.audit.selector.js

import { getAuditHistory } from "./audit.history.js";

/**
 * সব Auto Action audit
 */
export function getAllAutoActionAudits() {
  return getAuditHistory()
    .filter(entry => entry.type === "AUTO_ACTION");
}

/**
 * নির্দিষ্ট device-এর Auto Action audit
 */
export function getAutoActionAuditsByDevice(deviceId) {
  return getAuditHistory()
    .filter(
      entry =>
        entry.type === "AUTO_ACTION" &&
        entry.deviceId === deviceId
    );
}

// 🔒 Phase-13.5-B helper: normalize explain payload
function mapExplain(entry) {
  const explain = entry.explain || {};

  return {
    decision: explain.decision || entry.stage,
    reasons: explain.reasons || [],
    confidence: explain.confidence || null,
    contextSummary: explain.contextSummary || null,
    rule: explain.rule || null   // 🆕 IMPORTANT
  };
}


/**
 * Explainable Auto Action audit (UI-ready)
 */
export function getExplainableAutoActionAudits() {
  return getAuditHistory()
    .filter(entry => entry.type === "AUTO_ACTION")
    .map(entry => ({
      ...entry,
      explain: mapExplain(entry)
    }));
}

/**
 * Explainable Auto Action audit by device
 */
export function getExplainableAutoActionAuditsByDevice(deviceId) {
  return getAuditHistory()
    .filter(
      entry =>
        entry.type === "AUTO_ACTION" &&
        entry.deviceId === deviceId
    )
    .map(entry => ({
      ...entry,
      explain: mapExplain(entry)
    }));
}

/**
 * 🔮 TASK-121 helper: last auto-action block (predictive / guard)
 */
export function getLastAutoActionBlock(deviceId) {
  const logs = getAuditHistory();
  if (!logs.length) return null;

  for (let i = logs.length - 1; i >= 0; i--) {
    const entry = logs[i];

    if (
      entry.deviceId === deviceId &&
      entry.stage === "AUTO_ACTION_BLOCKED"
    ) {
      return entry;
    }
  }

  return null;
}
