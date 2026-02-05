// dashboard/js/learning/risk.decay.engine.js
// 🔒 Phase-12.5-B: smoothing config
const SMOOTHING_ALPHA = 0.3; // 0 < alpha <= 1
const MIN_FACTOR = 0.2;
const MAX_FACTOR = 1;

/**
 * Time-based risk decay
 */
export function applyRiskDecay(risk) {
  if (!risk || risk.level === "UNKNOWN") return risk;

  const now = Date.now();
  const age = now - (risk.lastUpdated || now);

 let rawFactor = 1;

if (age > 60 * 60 * 1000) rawFactor = 0.2;
else if (age > 30 * 60 * 1000) rawFactor = 0.4;
else if (age > 10 * 60 * 1000) rawFactor = 0.7;

// 🔒 Phase-12.5-B: exponential smoothing
const prev = typeof risk.decayFactor === "number"
  ? risk.decayFactor
  : rawFactor;

let factor =
  SMOOTHING_ALPHA * rawFactor +
  (1 - SMOOTHING_ALPHA) * prev;

// clamp
factor = Math.max(MIN_FACTOR, Math.min(MAX_FACTOR, factor));

  return {
    ...risk,
    effectiveFailureRate: risk.failureRate * factor,
    decayFactor: factor
  };
}
