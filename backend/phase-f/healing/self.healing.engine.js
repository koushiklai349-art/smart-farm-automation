const { runtime } = require("../../store/runtime.store");

function applySelfHealing() {

  const weights = runtime.arbitrationWeights || {};
  const config = runtime.selfHealing;

  Object.keys(weights).forEach(reason => {

    // decay towards 0
    weights[reason] *= config.decayFactor;

    // snap small values to zero
    if (Math.abs(weights[reason]) < config.neutralZone) {
      weights[reason] = 0;
    }
  });

  console.log("🩹 Self-Healing Applied");
}

module.exports = {
  applySelfHealing
};