const { runtime } = require("../../store/runtime.store");

function evaluateMetaLearning() {

  const guard = runtime.aiGuard;
  const meta = runtime.metaLearning;

  const weights = Object.values(runtime.arbitrationWeights || {});
  if (!weights.length) return;

  const max = Math.max(...weights);
  const min = Math.min(...weights);

  const spread = max - min;

  // যদি system খুব stable হয়
  if (spread < 5) {
    meta.learningRate = Math.max(meta.minRate, meta.learningRate - 0.1);
  }

  // যদি imbalance বেশি হয়
  if (spread > 15) {
    meta.learningRate = Math.min(meta.maxRate, meta.learningRate + 0.2);
  }

  console.log("🧠 Meta Learning Rate:", meta.learningRate);
}

module.exports = {
  evaluateMetaLearning
};