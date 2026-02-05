// recovery.playbook.suppression.store.js

const suppressionHistory = [];

/**
 * Record suppression event
 */
export function recordSuppression({
  action,
  weight,
  reason
}) {
  suppressionHistory.push({
    id: crypto.randomUUID(),
    action,
    weight,
    reason,
    suppressedAt: Date.now(),
    recoveredAt: null
  });
}

/**
 * Record unsuppression (trust recovery)
 */
export function recordUnsuppression(action, weight) {
  const last = [...suppressionHistory]
    .reverse()
    .find(
      s =>
        s.action === action &&
        s.recoveredAt === null
    );

  if (!last) return;

  last.recoveredAt = Date.now();
  last.recoveredWeight = weight;
}

/**
 * Read history (analytics / UI)
 */
export function getSuppressionHistory(action = null) {
  return suppressionHistory.filter(
    s => !action || s.action === action
  );
}
