// dashboard/js/recovery/playbook/recovery.playbook.outcome.store.js
import { recordActionOutcome } from "../../learning/action.outcome.stats.js";
import { adjustActionWeight } from "./recovery.playbook.weight.store.js";
import { auditStore } from "../../audit/audit.store.js";
import { TRUST_SUPPRESS_THRESHOLD } from "./recovery.playbook.trust.js";
import { getActionWeight } from "./recovery.playbook.weight.store.js";


const outcomes = [];
const suppressedActions = new Set(); // key = deviceId:action

const suppressionHistory = []; 

export function suppressAction(
  action,
  deviceId,
  {
    reason = "LOW_TRUST",
    weight = null
  } = {}
) {
  const key = `${deviceId}:${action}`;

  if (suppressedActions.has(key)) return;

  suppressedActions.add(key);

  suppressionHistory.push({
    deviceId,
    action,
    reason,
    weight,
    suppressedAt: Date.now(),
    recoveredAt: null
  });
}

export function unsuppressAction(action) {
  if (!suppressedActions.has(action)) return;

  suppressedActions.delete(action);

  const last = [...suppressionHistory]
    .reverse()
    .find(h => h.action === action && !h.recoveredAt);

  if (last) {
    last.recoveredAt = Date.now();
  }

  // 🔥 STEP-166.3: timeline recovery event
  auditStore.log({
    type: "PLAYBOOK_OUTCOME",
    action,
    status: "RECOVERED",
    meta: {
      previousReason: last?.reason || "LOW_TRUST",
      recoveredAt: Date.now()
    },
    at: Date.now()
  });
}

export function autoUnsuppressIfRecovered({
  deviceId,
  action,
  currentWeight
}) {
  if (!isActionCurrentlySuppressed(action, deviceId)) return;

  if (currentWeight >= TRUST_SUPPRESS_THRESHOLD + 10) {
    unsuppressAction(action, deviceId);

    auditStore.log({
      type: "PLAYBOOK_UNSUPPRESSED",
      action,
      deviceId,
      weight: currentWeight,
      at: Date.now()
    });
  }
}

export function getSuppressionHistory(action = null) {
  return action
    ? suppressionHistory.filter(s => s.action === action)
    : [...suppressionHistory];
}
/**
 * Record playbook action execution
 */
export function recordPlaybookAction({
  action,
  deviceId,
  incidentId = null,
  explain = null
}) {
  outcomes.push({
    id: crypto.randomUUID(),
    action,
    deviceId,
    incidentId,
    executedAt: Date.now(),
    status: "PENDING", // SUCCESS | FAILED | NO_EFFECT
    resolvedAt: null,
    meta: explain ? { explain } : {}
  });
}

/**
 * Mark outcome result
 */
export function resolvePlaybookOutcome({
  action,
  deviceId,
  status,
  meta = {}
}) {
  const item = [...outcomes]
    .reverse()
    .find(
      o =>
        o.action === action &&
        o.deviceId === deviceId &&
        o.status === "PENDING"
    );

  if (!item) return;

  item.status = status;
  item.resolvedAt = Date.now();
  item.meta = {
    ...item.meta,
    ...meta
  };

  auditStore.log({ type: "PLAYBOOK_OUTCOME",action,deviceId,status,meta: item.meta || null,at: Date.now()  });

  // 🧠 learn from outcome
  if (["SUCCESS", "FAILED", "NO_EFFECT"].includes(status)) {
    recordActionOutcome({ deviceId,action,outcome: status });
    adjustActionWeight(action, status);

    autoUnsuppressIfRecovered({
    deviceId,
    action,
    currentWeight: getActionWeight(action)
    });

    // 🚨 TASK-162: auto suppress low-trust actions
    const currentWeight = getActionWeight(action);

if (currentWeight < TRUST_SUPPRESS_THRESHOLD) {
  suppressAction(action, deviceId, {
  reason: "Trust score below threshold",
  weight: currentWeight
  });


  // 🔥 STEP-166.2: inject timeline event
  auditStore.log({
    type: "PLAYBOOK_OUTCOME",
    action,
    deviceId,
    status: "SUPPRESSED",
    meta: {
      reason: "Trust score below threshold",
      weight: currentWeight
    },
    at: Date.now()
  });

  auditStore.log({
    type: "PLAYBOOK_SUPPRESSED",
    action,
    deviceId,
    weight: currentWeight,
    at: Date.now()
  });
}


  }
}


/**
 * Read-only access (analytics only)
 */
export function getPlaybookOutcomes() {
  return [...outcomes];
}


export function isActionSuppressed(action, deviceId) {
  return suppressedActions.has(`${deviceId}:${action}`);
}


export function getRecentPlaybookOutcomes(action, limit = 5) {
  return [...outcomes]
    .filter(o => o.action === action)
    .slice(-limit);
}

export function getSuppressedActions() {
  return Array.from(suppressedActions);
}

export function isActionCurrentlySuppressed(action, deviceId) {
  return suppressedActions.has(`${deviceId}:${action}`);
}


export function getSuppressionExplain(action) {
  const entry = [...suppressionHistory]
    .reverse()
    .find(h => h.action === action && !h.recoveredAt);

  if (!entry) return null;

  return {
    action,
    reason: entry.reason,
    weight: entry.weight,
    suppressedAt: entry.suppressedAt
  };
}

window.getSuppressionExplain = getSuppressionExplain;