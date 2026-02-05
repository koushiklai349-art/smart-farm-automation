import { calculateSystemStabilityScore } from "./system.stability.engine.js";

let lastAlertStats = (() => {
  try {
    const raw = localStorage.getItem(ALERT_TREND_STORAGE_KEY);
    return raw
      ? JSON.parse(raw)
      : { warning: 0, critical: 0 };
  } catch {
    return { warning: 0, critical: 0 };
  }
})();

const ALERT_TREND_STORAGE_KEY = "dashboard.alert.trend.snapshot";

const SAMPLE_INTERVAL_MS = 60 * 1000; // 1 minute
const WINDOW_MS = 60 * 60 * 1000;     // 1 hour

const trend = []; // { ts, score }

function sample() {
  const { score } = calculateSystemStabilityScore();
  const now = Date.now();

 trend.push({
  ts: now,
  score,
  alerts: lastAlertStats
});


  // prune old samples
  const cutoff = now - WINDOW_MS;
  while (trend.length && trend[0].ts < cutoff) {
    trend.shift();
  }
}

// start sampler
setInterval(sample, SAMPLE_INTERVAL_MS);


export function getStabilityTrend() {
  return [...trend];
}


window.addEventListener(
  "ALERT_ANALYTICS_UPDATED",
  (e) => {
    lastAlertStats = {
      warning: e.detail.warning || 0,
      critical: e.detail.critical || 0
    };

    try {
      localStorage.setItem(
        ALERT_TREND_STORAGE_KEY,
        JSON.stringify(lastAlertStats)
      );
    } catch {}
  }
);
