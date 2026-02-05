import { getAuditHistory } from "../audit/audit.history.js";
import { analyzeOverrideImpact } from "./operator.override.impact.js";
import { canApplyTrustRecovery,markTrustRecovered } from "./operator.trust.recovery.js";


function decayWeight(ageMs) {
  const ageDays = ageMs / (24 * 60 * 60 * 1000);
  return Math.exp(-ageDays / 7); // 7-day half-life approx
}

const MAX_SCORE = 100;
const BASE_SCORE = 70;
const MAX_OVERRIDES = 10;

export function calculateOperatorTrustScore({ untilTs = Date.now() } = {}) {
  const audits = getAuditHistory().filter(a => {
  const ts =
    a.startedAt ||
    a.endedAt ||
    new Date(a.at || 0).getTime();
  return ts <= untilTs;
});


  // last N override ENABLE events
  const overrides = audits
    .filter(
      e =>
        e.type === "OPERATOR_OVERRIDE" &&
        e.action === "ENABLE"
    )
    .slice(0, MAX_OVERRIDES);

  let score = BASE_SCORE;
  const breakdown = [];

  overrides.forEach(ov => {
  const start = ov.startedAt;
  const ageMs = Date.now() - start;
  const weight = decayWeight(ageMs);

  const end =
    audits.find(
      a =>
        a.type === "OPERATOR_OVERRIDE" &&
        a.action !== "ENABLE" &&
        a.endedAt &&
        a.endedAt > start
    )?.endedAt || Date.now();

  const impact = analyzeOverrideImpact(start, end);

  let rawDelta = 0;
  if (impact.failureRate <= 20) rawDelta = +5;
  else if (impact.failureRate <= 40) rawDelta = +2;
  else rawDelta = -5;

  const delta = Math.round(rawDelta * weight);
  score += delta;

  breakdown.push({
    overrideAt: start,
    failureRate: impact.failureRate,
    rawDelta,
    weight: Number(weight.toFixed(2)),
    delta
  });
});

// 🟢 Trust recovery if no recent overrides
const lastOverride = overrides[0]?.startedAt || 0;
const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

if (lastOverride < oneDayAgo && canApplyTrustRecovery()) {
  score += 2;
  markTrustRecovered();

  breakdown.push({
    recovery: true,
    delta: +2,
    reason: "No overrides in last 24h"
  });
}

  score = Math.max(0, Math.min(MAX_SCORE, score));

  return {
    score,
    breakdown
  };
}
