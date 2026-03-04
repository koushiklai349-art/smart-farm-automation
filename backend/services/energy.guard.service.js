const { runtime } = require("../store/runtime.store");

function canExecuteEnergyAware(deviceId) {
  const energy = runtime.energy || {};

  if (!energy.limit) return true; // no limit set

  if ((energy.currentUsage || 0) >= energy.limit) {
    return false;
  }

  return true;
}

module.exports = {
  canExecuteEnergyAware
};