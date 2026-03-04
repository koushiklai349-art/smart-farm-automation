const { runtime } = require("../../store/runtime.store");

function ensurePerformanceStore() {
  runtime.arbitrationPerformance =
    runtime.arbitrationPerformance || {};
}

function recordArbitrationOutcome(winner) {
  ensurePerformanceStore();

  const reason = winner.reason;

  runtime.arbitrationPerformance[reason] =
    runtime.arbitrationPerformance[reason] || {
      wins: 0,
      evaluations: 0,
      lastUpdated: null
    };

  runtime.arbitrationPerformance[reason].wins++;
  runtime.arbitrationPerformance[reason].evaluations++;
  runtime.arbitrationPerformance[reason].lastUpdated = Date.now();
}

function recordArbitrationEvaluation(queue) {
  ensurePerformanceStore();

  queue.forEach(entry => {
    const reason = entry.reason;

    runtime.arbitrationPerformance[reason] =
      runtime.arbitrationPerformance[reason] || {
        wins: 0,
        evaluations: 0,
        lastUpdated: null
      };

    runtime.arbitrationPerformance[reason].evaluations++;
    runtime.arbitrationPerformance[reason].lastUpdated = Date.now();
  });
}

function autoRebalanceWeights() {
  ensurePerformanceStore();

  const perf = runtime.arbitrationPerformance;
  runtime.arbitrationWeights =
    runtime.arbitrationWeights || {};

  const trustIndex = runtime.trustIndex || {};
  const driftDetected = runtime.aiDrift?.detected;

  Object.keys(perf).forEach(reason => {

    const stats = perf[reason];
    if (stats.evaluations < 5) return;

    const successRate =
      stats.wins / stats.evaluations;

    const currentWeight =
      runtime.arbitrationWeights[reason] || 0;

    // 🔹 Performance Factor
    let performanceAdjustment = 0;
    if (successRate > 0.7) performanceAdjustment = +1;
    else if (successRate < 0.4) performanceAdjustment = -1;

    // 🔹 Trust Multiplier
    const trustScore =
      trustIndex.reasons?.[reason]?.score || 50;

    let trustMultiplier = 1;

    if (trustScore >= 80) trustMultiplier = 1.2;
    else if (trustScore >= 60) trustMultiplier = 1.0;
    else if (trustScore >= 40) trustMultiplier = 0.7;
    else trustMultiplier = 0.4;

    // 🔹 Drift Safety
    let driftFactor = 1;
    if (driftDetected) driftFactor = 0.5;

    const finalAdjustment =
      performanceAdjustment *
      trustMultiplier *
      driftFactor;

    let newWeight =
      currentWeight + finalAdjustment;

    // 🔐 Clamp Protection
    if (newWeight > 50) newWeight = 50;
    if (newWeight < -20) newWeight = -20;

    runtime.arbitrationWeights[reason] =
      Math.round(newWeight * 10) / 10;
  });

  console.log("⚖ Trust-Fused Auto Rebalance Complete");
}

module.exports = {
  recordArbitrationOutcome,
  recordArbitrationEvaluation,
  autoRebalanceWeights
};