// js/prediction/prediction.engine.js

import { PREDICTION_RULES } from "./prediction.rules.js";
import { RISK_LEVEL, PREDICTION_SIGNAL } from "./prediction.types.js";
import { savePrediction } from "./prediction.store.js";

export function evaluateRisk({
  deviceId,
  stabilityHistory = [],
  incidentHistory = [],
}) {
  const signals = [];
  let risk = RISK_LEVEL.LOW;

  // Rule-1: Stability drop
  if (stabilityHistory.length >= 2) {
    const diff =
      stabilityHistory[0].score -
      stabilityHistory[stabilityHistory.length - 1].score;

    if (diff >= PREDICTION_RULES.STABILITY_DROP.threshold) {
      signals.push(PREDICTION_SIGNAL.STABILITY_DROP);
      risk = RISK_LEVEL.MEDIUM;
    }
  }

  // Rule-2: Frequent incidents
  if (incidentHistory.length >= PREDICTION_RULES.FREQUENT_INCIDENT.count) {
    signals.push(PREDICTION_SIGNAL.FREQUENT_INCIDENT);
    risk = RISK_LEVEL.HIGH;
  }

  const prediction = {
    deviceId,
    risk,
    signals,
    at: Date.now(),
  };

  savePrediction(deviceId, prediction);
  return prediction;
}
