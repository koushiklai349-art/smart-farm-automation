const { runtime } = require("../../store/runtime.store");

function evaluateAdaptiveMode(deviceId) {

  runtime.adaptive = runtime.adaptive || { devices: {} };
  runtime.adaptive.devices =
    runtime.adaptive.devices || {};

  const risk =
    runtime.predictive?.devices?.[deviceId] ?? 0;

  const energyUsage =
    runtime.energy?.usage ?? 0;

  const energyLimit =
    runtime.energy?.limit ?? 100;

  let mode = "BALANCED";

  // 🔥 ENERGY + RISK HYBRID LOGIC

  if (risk >= 60 && energyUsage < energyLimit * 0.8) {
    mode = "AGGRESSIVE";
  }
  else if (risk >= 60 && energyUsage >= energyLimit * 0.8) {
    mode = "BALANCED";
  }
  else if (risk < 20 && energyUsage > energyLimit * 0.7) {
    mode = "ECO";
  }
  else if (risk < 20) {
    mode = "ECO";
  }

  runtime.adaptive.devices[deviceId] = {
    mode,
    avgRisk: risk,
    energyUsage,
    updatedAt: Date.now()
  };

  console.log("⚙️ Adaptive Mode:", deviceId, mode);

  return mode;
}

module.exports = {
  evaluateAdaptiveMode
};