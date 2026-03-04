const { runtime } = require("../../store/runtime.store");

function ensureArchitecture() {
  runtime.architecture = runtime.architecture || {
    modules: {
      PREDICTIVE: true,
      SWARM: true,
      LONG_TERM: true,
      META: true,
      GLOBAL: true
    },
    lastEvaluated: null
  };
}

function evaluateArchitecture() {
  ensureArchitecture();

  const avgRisk = calculateAvgRisk();
  const drift = runtime.aiDrift?.detected;
  const energyUsage =
    runtime.energy?.todayUsage || 0;
  const energyLimit =
    runtime.energy?.dailyLimit || 1000;

  const energyPercent =
    (energyUsage / energyLimit) * 100;

  // 🔹 Disable predictive if risk low
  if (avgRisk < 30) {
    runtime.architecture.modules.PREDICTIVE = false;
  } else {
    runtime.architecture.modules.PREDICTIVE = true;
  }

  // 🔹 Disable swarm if stable
  if (!drift && avgRisk < 40) {
    runtime.architecture.modules.SWARM = false;
  } else {
    runtime.architecture.modules.SWARM = true;
  }

  // 🔹 Disable long-term optimization if energy critical
  if (energyPercent > 95) {
    runtime.architecture.modules.LONG_TERM = false;
  } else {
    runtime.architecture.modules.LONG_TERM = true;
  }

  runtime.architecture.lastEvaluated = Date.now();

  console.log("🧬 Architecture Updated:",
    runtime.architecture.modules);
}

function calculateAvgRisk() {
  const devices =
    runtime.predictive?.devices || {};

  let total = 0;
  let count = 0;

  Object.values(devices).forEach(d => {
    if (d.riskScore != null) {
      total += d.riskScore;
      count++;
    }
  });

  return count ? total / count : 0;
}

function isModuleActive(moduleName) {
  return runtime.architecture?.modules?.[moduleName];
}

module.exports = {
  evaluateArchitecture,
  isModuleActive
};