const { runtime } = require("../../store/runtime.store");

function evaluateSelfOptimization() {

  if (!runtime.selfOptimization?.enabled) return;

  const weights = Object.values(runtime.arbitrationWeights || {});
  if (!weights.length) return;

  const max = Math.max(...weights);
  const min = Math.min(...weights);

  const spread = max - min;

  const meta = runtime.metaLearning;
  const opt = runtime.selfOptimization;

  // 🔥 High volatility → reduce cooldown
  if (spread > opt.volatilityThreshold) {
    runtime.globalCooldown =
      Math.max(opt.cooldownMin,
        (runtime.globalCooldown || 15000) - 2000);

    meta.learningRate =
      Math.min(meta.maxRate, meta.learningRate + 0.1);

    console.log("⚙ High volatility → Faster reaction");
  }

  // 🟢 Stable → increase cooldown
  if (spread < 5) {
    runtime.globalCooldown =
      Math.min(opt.cooldownMax,
        (runtime.globalCooldown || 15000) + 2000);

    meta.learningRate =
      Math.max(meta.minRate, meta.learningRate - 0.1);

    console.log("⚙ Stable → Slower learning mode");
  }

  console.log("📊 Cooldown:", runtime.globalCooldown);
  console.log("📊 LearningRate:", meta.learningRate);
}

module.exports = {
  evaluateSelfOptimization
};