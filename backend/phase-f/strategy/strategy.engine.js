const { runtime } = require("../../store/runtime.store");

function ensureStrategy() {
  runtime.strategy = runtime.strategy || {
    mode: "NORMAL",
    lastUpdated: null,
    reason: null
  };
}

function evaluateStrategy() {
  ensureStrategy();

  const riskDevices =
    runtime.predictive?.devices || {};

  const deviceHealth =
    runtime.health?.devices || {};

  const energyUsage =
    runtime.energy?.todayUsage || 0;

  const energyLimit =
    runtime.energy?.dailyLimit || 1000;

  const driftDetected =
    runtime.aiDrift?.detected;

  // 🔹 Calculate Avg Risk
  let totalRisk = 0;
  let count = 0;

  Object.values(riskDevices).forEach(d => {
    if (d.riskScore != null) {
      totalRisk += d.riskScore;
      count++;
    }
  });

  const avgRisk =
    count ? totalRisk / count : 0;

  const energyPercent =
    (energyUsage / energyLimit) * 100;

  let newMode = "NORMAL";
  let reason = "STABLE";

  if (avgRisk > 70) {
    newMode = "AGGRESSIVE";
    reason = "HIGH_RISK";
  }

  if (energyPercent > 90) {
    newMode = "CONSERVATIVE";
    reason = "HIGH_ENERGY_USAGE";
  }

  if (driftDetected) {
    newMode = "CONSERVATIVE";
    reason = "AI_DRIFT";
  }

  if (runtime.strategy.mode !== newMode) {
    console.log("🔄 Strategy Switched:",
      runtime.strategy.mode,
      "→",
      newMode,
      "| Reason:",
      reason);
  }

  runtime.strategy.mode = newMode;
  runtime.strategy.lastUpdated = Date.now();
  runtime.strategy.reason = reason;
}

module.exports = {
  evaluateStrategy
};