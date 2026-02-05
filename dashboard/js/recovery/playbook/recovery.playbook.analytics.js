// dashboard/js/recovery/playbook/recovery.playbook.analytics.js

import {
  getPlaybookOutcomes
} from "./recovery.playbook.outcome.store.js";

/**
 * Build effectiveness analytics for playbook actions
 *
 * @returns {Object} analytics keyed by action
 *
 * Example:
 * {
 *   RETRY_DEVICE: {
 *     total: 5,
 *     SUCCESS: 3,
 *     NO_EFFECT: 2,
 *     FAILED: 0,
 *     successRate: 60
 *   }
 * }
 */
export function computePlaybookEffectiveness() {
  const outcomes = getPlaybookOutcomes?.() || [];

  const stats = {};

  for (const o of outcomes) {
    if (!o?.action) continue;

    if (!stats[o.action]) {
      stats[o.action] = {
        total: 0,
        SUCCESS: 0,
        NO_EFFECT: 0,
        FAILED: 0,
        successRate: 0
      };
    }

    stats[o.action].total += 1;

    if (o.status === "SUCCESS") {
      stats[o.action].SUCCESS += 1;
    } else if (o.status === "NO_EFFECT") {
      stats[o.action].NO_EFFECT += 1;
    } else {
      stats[o.action].FAILED += 1;
    }
  }

  // compute success rate
  Object.values(stats).forEach(s => {
    s.successRate =
      s.total > 0
        ? Math.round((s.SUCCESS / s.total) * 100)
        : 0;
  });

  return stats;
}

// 🔧 DEV helper (safe, optional)
if (typeof window !== "undefined") {
  window.computePlaybookEffectiveness = computePlaybookEffectiveness;
}
