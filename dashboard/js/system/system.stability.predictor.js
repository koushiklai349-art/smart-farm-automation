import { getStabilityTrend } from "./system.stability.trend.store.js";

const FORECAST_MINUTES = 10;

export function predictStability() {
  const trend = getStabilityTrend();
  if (trend.length < 2) return null;

  // use last 10 minutes of data
  const now = Date.now();
  const windowStart = now - FORECAST_MINUTES * 60 * 1000;
  const recent = trend.filter(p => p.ts >= windowStart);

  if (recent.length < 2) return null;

  const first = recent[0];
  const last = recent[recent.length - 1];

  const dtMin = (last.ts - first.ts) / 60000; // minutes
  if (dtMin <= 0) return null;

  const slope = (last.score - first.score) / dtMin; // score per min
  const predictedScore = Math.round(
    last.score + slope * FORECAST_MINUTES
  );

  let label = "Stable";
  let risk = "low";

  if (predictedScore < 40) {
    label = "Likely Critical";
    risk = "high";
  } else if (predictedScore < 60) {
    label = "Likely Degraded";
    risk = "medium";
  } else if (predictedScore < 80) {
    label = "Risk of Degradation";
    risk = "medium";
  }

  return {
    current: last.score,
    predicted: Math.max(0, Math.min(100, predictedScore)),
    slope: Number(slope.toFixed(2)),
    label,
    risk
  };
}
