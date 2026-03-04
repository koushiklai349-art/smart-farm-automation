const { runtime } = require("../../store/runtime.store");

function evaluateAIDrift() {

  const weights = runtime.arbitrationWeights || {};
  const guard = runtime.aiGuard || {};

  let driftDetected = false;

  Object.keys(weights).forEach(reason => {

    if (weights[reason] > guard.maxWeight) {
      weights[reason] = guard.maxWeight;
      driftDetected = true;
    }

    if (weights[reason] < guard.minWeight) {
      weights[reason] = guard.minWeight;
      driftDetected = true;
    }
  });

  // global imbalance check
  const values = Object.values(weights);
  if (values.length > 1) {

    const max = Math.max(...values);
    const min = Math.min(...values);

    if (max - min > guard.driftThreshold) {
      console.log("⚠ AI DRIFT DETECTED — Normalizing");

      Object.keys(weights).forEach(reason => {
        weights[reason] *= 0.7; // dampen all
      });

      driftDetected = true;
    }
  }

  if (driftDetected) {
    console.log("🛡 AI Guard Applied Stability Correction");
  }
}

module.exports = {
  evaluateAIDrift
};