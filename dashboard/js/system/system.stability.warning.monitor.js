import { getStabilityTrend } from "./system.stability.trend.store.js";
import { raiseAlert } from "../core/alert/alert.manager.js";

const CHECK_INTERVAL_MS = 60 * 1000; // 1 min
const COOLDOWN_MS = 5 * 60 * 1000;   // 5 min

let lastAlertAt = 0;

function checkRapidDrop(trend) {
  const now = Date.now();
  const tenMinAgo = now - 10 * 60 * 1000;

  const recent = trend.filter(p => p.ts >= tenMinAgo);
  if (recent.length < 2) return false;

  const drop = recent[0].score - recent[recent.length - 1].score;
  return drop >= 20;
}

function checkContinuousDown(trend) {
  if (trend.length < 3) return false;

  const a = trend[trend.length - 3].score;
  const b = trend[trend.length - 2].score;
  const c = trend[trend.length - 1].score;

  return a > b && b > c;
}

setInterval(() => {
  const now = Date.now();
  if (now - lastAlertAt < COOLDOWN_MS) return;

  const trend = getStabilityTrend();
  if (!trend.length) return;

  if (checkRapidDrop(trend) || checkContinuousDown(trend)) {
    lastAlertAt = now;

    raiseAlert(
      {
        code: "STABILITY_DROP_WARNING",
        severity: "warning",
        message: "System stability dropping rapidly"
      },
      {
        lastScore: trend[trend.length - 1].score
      }
    );
  }
}, CHECK_INTERVAL_MS);
