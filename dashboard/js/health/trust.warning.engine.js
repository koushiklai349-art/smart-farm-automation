// dashboard/js/health/trust.warning.engine.js
import { getAllTrust } from "./trust.store.js";
import { getTrustSlope } from "./trust.trend.engine.js";
import { raiseAlert } from "../core/alert/alert.manager.js";

const SLOPE_WARN = -0.02; // per second
const SCORE_FLOOR = 55;
const COOLDOWN_MS = 10 * 60 * 1000;

const lastWarn = new Map();

export function checkEarlyWarnings() {
  const now = Date.now();

  getAllTrust().forEach(({ deviceId, score }) => {
    const slope = getTrustSlope(deviceId);

    if (score > SCORE_FLOOR) return;
    if (slope > SLOPE_WARN) return;

    const last = lastWarn.get(deviceId) || 0;
    if (now - last < COOLDOWN_MS) return;

    lastWarn.set(deviceId, now);

    raiseAlert(
      {
        code: "TRUST_EARLY_DROP",
        severity: "warning",
        message: "Early warning: device trust declining"
      },
      { deviceId, score, slope }
    );
  });
}
