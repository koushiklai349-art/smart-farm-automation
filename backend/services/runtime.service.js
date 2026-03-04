const { runtime } = require("../store/runtime.store");
const { saveRuntime } = require("../store/runtime.persistence");

function setAiMode(enabled) {
  runtime.aiMode = runtime.aiMode || {};
  runtime.aiMode.enabled = Boolean(enabled);
  saveRuntime();
  return runtime.aiMode;
}

function setEnergyLimit(limit) {
  runtime.energy = runtime.energy || {};
  runtime.energy.dailyLimit = Number(limit);
  saveRuntime();
  return runtime.energy;
}

function setDigitalTwinMode(enabled) {
  runtime.digitalTwin = runtime.digitalTwin || {};
  runtime.digitalTwin.enabled = Boolean(enabled);
  saveRuntime();
  return runtime.digitalTwin;
}

module.exports = {
  setAiMode,
  setEnergyLimit,
  setDigitalTwinMode
};