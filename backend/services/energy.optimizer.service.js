const { runtime } = require("../store/runtime.store");

function evaluateEnergy(deviceId) {

  const energy = runtime.energy;

  if (!energy) return;

  const usageRatio = energy.todayUsage / energy.dailyLimit;

  if (usageRatio < 0.6) {
    return { action: "NORMAL" };
  }

  if (usageRatio < 0.8) {
    return { action: "REDUCE_LOAD" };
  }

  if (usageRatio < 1) {
    return { action: "DELAY_NON_CRITICAL" };
  }

  return { action: "ENERGY_CRITICAL" };
}

function updateEnergyUsage(amount) {

  runtime.energy.todayUsage =
    (runtime.energy.todayUsage || 0) + amount;

  return runtime.energy.todayUsage;
}

module.exports = {
  evaluateEnergy,
  updateEnergyUsage
};