const { runtime } = require("../../store/runtime.store");

function ensureLongTermMemory() {
  runtime.longTermMemory = runtime.longTermMemory || {
    lastEvaluated: null
  };
}

function evaluateLongTermOptimization() {
  ensureLongTermMemory();

  const history =
    runtime.arbitrationHistory || [];

  if (history.length < 20) return; // need enough data

  const reasonCount = {};

  history.slice(-50).forEach(entry => {
    const reason = entry.winner?.reason;
    if (!reason) return;

    reasonCount[reason] =
      (reasonCount[reason] || 0) + 1;
  });

  const highThresholdFreq =
    reasonCount["HIGH_THRESHOLD"] || 0;

  const predictiveFreq =
    reasonCount["PREDICTIVE_PREVENTION"] || 0;

  const energyUsage =
    runtime.energy?.todayUsage || 0;

  const energyLimit =
    runtime.energy?.dailyLimit || 1000;

  const energyPercent =
    (energyUsage / energyLimit) * 100;

  // 🔹 Auto Adjust Fan Threshold
  if (highThresholdFreq > 15) {
    runtime.learning.thresholds.fanTempLow -= 1;
    console.log("📉 Adjusted fanTempLow (Long-Term)");
  }

  // 🔹 Predictive overuse correction
  if (predictiveFreq > 20) {
    runtime.arbitrationWeights["PREDICTIVE_PREVENTION"] -= 1;
    console.log("📉 Reduced Predictive Weight");
  }

  // 🔹 Energy protection
  if (energyPercent > 95) {
    runtime.strategy.mode = "CONSERVATIVE";
    console.log("🔋 Forced CONSERVATIVE (Energy Protection)");
  }

  runtime.longTermMemory.lastEvaluated = Date.now();
}

module.exports = {
  evaluateLongTermOptimization
};