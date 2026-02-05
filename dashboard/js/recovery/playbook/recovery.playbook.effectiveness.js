import { getPlaybookOutcomes }
  from "./recovery.playbook.outcome.store.js";

/**
 * Compute effectiveness of playbook actions
 */
export function computePlaybookEffectiveness({ sinceMs = null } = {}) {
  const outcomes = getPlaybookOutcomes();
  const stats = {};

  const filtered = sinceMs
    ? outcomes.filter(o => o.at >= sinceMs)
    : outcomes;

  for (const o of filtered) {
    const action = o.action;
    const status = o.status || "UNKNOWN";

    if (!stats[action]) {
      stats[action] = {
        total: 0,
        SUCCESS: 0,
        FAILED: 0,
        NO_EFFECT: 0,
        successRate: 0
      };
    }

    stats[action].total++;

    if (status === "SUCCESS") stats[action].SUCCESS++;
    else if (status === "FAILED") stats[action].FAILED++;
    else stats[action].NO_EFFECT++;
  }

  for (const a of Object.values(stats)) {
    a.successRate =
      a.total > 0
        ? Math.round((a.SUCCESS / a.total) * 100)
        : 0;
  }

  return stats;
}


// 🔎 debug access (optional)
window.computePlaybookEffectiveness = computePlaybookEffectiveness;
