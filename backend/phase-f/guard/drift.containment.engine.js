const { runtime } = require("../../store/runtime.store");

function evaluateDriftContainment() {

  const history = runtime.arbitrationHistory || [];

  if (history.length < 20) return;

  const recent = history.slice(-20);

  const count = {};

  recent.forEach(entry => {
    const reason = entry.winner?.reason;
    if (!reason) return;
    count[reason] = (count[reason] || 0) + 1;
  });

  Object.keys(count).forEach(reason => {

    const dominance = count[reason] / 20;

    if (dominance > 0.8) {

      console.log("⚠ DRIFT DETECTED:", reason);

      runtime.arbitrationWeights =
        runtime.arbitrationWeights || {};

      runtime.arbitrationWeights[reason] =
        (runtime.arbitrationWeights[reason] || 0) - 5;

      console.log("🧠 Drift containment applied to:", reason);
    }
  });
}

module.exports = {
  evaluateDriftContainment
};