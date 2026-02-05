// js/stability/stability.engine.js

import { STABILITY_STATE, STABILITY_SCORE } from "./stability.types.js";
import { getStability, saveStability } from "./stability.store.js";

function evaluateState(score) {
  if (score >= 80) return STABILITY_STATE.STABLE;
  if (score >= 60) return STABILITY_STATE.DEGRADED;
  if (score >= 30) return STABILITY_STATE.UNSTABLE;
  return STABILITY_STATE.CRITICAL;
}

export function initStability(deviceId) {
  if (getStability(deviceId)) return;

  saveStability(deviceId, {
    deviceId,
    score: STABILITY_SCORE.MAX,
    state: STABILITY_STATE.STABLE,
    updatedAt: Date.now(),
  });
}

// 🔻 Negative impact
export function penalize(deviceId, points) {
  initStability(deviceId);

  const data = getStability(deviceId);

  data.score = Math.max(
    STABILITY_SCORE.MIN,
    data.score - points
  );
  data.state = evaluateState(data.score);
  data.updatedAt = Date.now();

  // ✅ FIRST save
  saveStability(deviceId, data);

  // ✅ THEN refresh UI
  if (typeof window !== "undefined" && window.refreshIncidentStabilityUI) {
    window.refreshIncidentStabilityUI();
  }

  return data;
}

// 🔺 Positive recovery
export function reward(deviceId, points) {
  initStability(deviceId);

  const data = getStability(deviceId);

  data.score = Math.min(
    STABILITY_SCORE.MAX,
    data.score + points
  );
  data.state = evaluateState(data.score);
  data.updatedAt = Date.now();

  // ✅ FIRST save
  saveStability(deviceId, data);

  // ✅ THEN refresh UI
  if (typeof window !== "undefined" && window.refreshIncidentStabilityUI) {
    window.refreshIncidentStabilityUI();
  }

  return data;
}
