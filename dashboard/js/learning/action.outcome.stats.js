// dashboard/js/learning/action.outcome.stats.js

const stats = new Map();
const lastOutcomeAt = new Map();
const OUTCOME_DEDUP_WINDOW_MS = 1000; // 1 second

/**
 * Outcome record করা (Learning-safe)
 */
export function recordActionOutcome({ deviceId, action, outcome }) {
  if (!deviceId || !action || !outcome) return;

  const dedupKey = `${deviceId}:${action}:${outcome}`;
  const now = Date.now();

  const last = lastOutcomeAt.get(dedupKey) || 0;
  if (now - last < OUTCOME_DEDUP_WINDOW_MS) {
    return; // 🔒 Phase-12.5-A skip duplicate outcome
  }
  lastOutcomeAt.set(dedupKey, now);

  const key = `${deviceId}:${action}`;

  if (!stats.has(key)) {
    stats.set(key, {
      deviceId,
      action,

      success: 0,
      failure: 0,
      noEffect: 0,
      total: 0,

      consecutiveSuccess: 0,
      consecutiveFailure: 0,

      lastOutcome: null,
      lastOutcomeTime: null,

      createdAt: now,
      lastUpdated: now
    });
  }

  const entry = stats.get(key);

  switch (outcome) {
    case "SUCCESS":
      entry.success += 1;
      entry.consecutiveSuccess += 1;
      entry.consecutiveFailure = 0;
      break;

    case "FAILURE":
      entry.failure += 1;
      entry.consecutiveFailure += 1;
      entry.consecutiveSuccess = 0;
      break;

    case "NO_EFFECT":
      entry.noEffect += 1;
      entry.consecutiveSuccess = 0;
      entry.consecutiveFailure = 0;
      break;

    default:
      console.warn("[ACTION_STATS] Unknown outcome:", outcome);
      return;
  }

  entry.total += 1;
  entry.lastOutcome = outcome;
  entry.lastOutcomeTime = now;
  entry.lastUpdated = now;
}

/**
 * Stats read (Risk engine use)
 */
export function getActionStats(deviceId, action) {
  return stats.get(`${deviceId}:${action}`);
}

/**
 * Old / inactive stats cleanup
 */
export function cleanupActionStats() {
  const now = Date.now();
  const TTL = 24 * 60 * 60 * 1000; // 24 hours

  stats.forEach((entry, key) => {
    if (now - entry.lastUpdated > TTL) {
      stats.delete(key);
    }
  });
}
