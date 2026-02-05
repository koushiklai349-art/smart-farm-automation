// dashboard/js/learning/action.risk.engine.js

import { getActionStats } from "./action.outcome.stats.js";

// 🔒 Phase-13.4-A helpers
function deriveConfidence({ total, score, consecutiveFailure }) {
  // খুব কম data হলে confidence low
  if (total < 5) return "LOW";

  // high risk বা ধারাবাহিক failure → low confidence
  if (score >= 0.6 || consecutiveFailure >= 3) return "LOW";

  // মাঝারি অবস্থা
  if (score >= 0.3) return "MEDIUM";

  // stable & low risk
  return "HIGH";
}

/**
 * Action risk score calculate করা (Explainable)
 */
export function getActionRisk(deviceId, action) {
  const stats = getActionStats(deviceId, action);

  if (!stats || typeof stats.total !== "number" || stats.total <= 0) {
    return null;
  }

  const {
    failure,
    noEffect,
    total,
    consecutiveFailure,
    consecutiveSuccess,
    lastOutcome,
    lastOutcomeTime,
    lastUpdated
  } = stats;

  // 🔹 Not enough data
  if (total < 5) {
    return {
      level: "UNKNOWN",
      score: 0,
      reason: "INSUFFICIENT_DATA",
      total,
      lastUpdated
    };
  }

  // 🔹 Base failure rate
  const failureRate = (failure + noEffect) / total;

  // 🔹 Recent behavior boost
  let recentPenalty = 0;
  if (consecutiveFailure >= 3) recentPenalty += 0.3;
  else if (consecutiveFailure === 2) recentPenalty += 0.15;

  let recentBonus = 0;
  if (consecutiveSuccess >= 5) recentBonus -= 0.2;
  else if (consecutiveSuccess >= 3) recentBonus -= 0.1;

  // 🔹 Time decay (older failure less impact)
  let timeFactor = 1;
  if (lastOutcomeTime) {
    const hoursAgo = (Date.now() - lastOutcomeTime) / (60 * 60 * 1000);
    if (hoursAgo > 12) timeFactor = 0.7;
    if (hoursAgo > 24) timeFactor = 0.5;
  }

  // 🔹 Final score
  let score = failureRate * timeFactor + recentPenalty + recentBonus;
  score = Math.max(0, Math.min(score, 1));

  // 🔹 Risk level
  let level = "LOW";
  if (score >= 0.6) level = "HIGH";
  else if (score >= 0.3) level = "MEDIUM";

  // 🔹 Explain reason
  let reason = "STABLE";
  if (consecutiveFailure >= 3) reason = "CONSECUTIVE_FAILURE";
  else if (failureRate >= 0.5) reason = "HIGH_FAILURE_RATE";
  else if (consecutiveSuccess >= 5) reason = "CONSISTENT_SUCCESS";
    // 🔒 Phase-13.4-A: confidence score
  const confidence = deriveConfidence({
    total,
    score,
    consecutiveFailure
  });

    return {
    level,
    score,
    confidence, // LOW | MEDIUM | HIGH
    reason,
    failureRate,
    total,
    lastOutcome,
    lastUpdated
  };

}
