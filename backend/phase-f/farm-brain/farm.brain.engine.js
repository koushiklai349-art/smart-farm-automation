const { runtime } = require("../../store/runtime.store");
const { proposeDecision } = require("../arbitration/arbitration.engine");

async function evaluateFarmBrain() {

  const devices = runtime.devices || {};
  const telemetry = runtime.telemetry || {};

  const deviceIds = Object.keys(devices);

  if (deviceIds.length === 0) return;

  let totalTemp = 0;
  let activeDevices = 0;

  for (let id of deviceIds) {
    const temp = telemetry[id]?.sensors?.temperature;
    if (temp != null) {
      totalTemp += temp;
      activeDevices++;
    }
  }

  if (activeDevices === 0) return;

  const avgTemp = totalTemp / activeDevices;

  console.log("🧠 Farm Brain Avg Temp:", avgTemp);

  // 🔥 Global Overheat Condition
  if (avgTemp >= 85) {

    console.log("🧠 FARM BRAIN: Global cooling mode");

    for (let id of deviceIds) {
     const currentState =
  runtime.actuatorState?.[id]?.fan;

if (currentState !== "ON") {

 proposeDecision({
  deviceId: id,
  action: "FAN_ON",
  reason: "FARM_BRAIN_GLOBAL_COOLING",
  source: "SYSTEM_AI",
  role: "SYSTEM"
});

}
    }
  }

  // 🌱 Energy Saving Mode
  if (runtime.energy?.todayUsage > runtime.energy?.dailyLimit) {

    console.log("🧠 FARM BRAIN: Energy saving mode");

    for (let id of deviceIds) {
     const currentState =
  runtime.actuatorState?.[id]?.fan;

if (currentState !== "OFF") {

  proposeDecision({
  deviceId: id,
  action: "FAN_OFF",
  reason: "FARM_BRAIN_ENERGY_SAVING",
  source: "SYSTEM_AI",
  role: "SYSTEM"
});

}
    }
  }
}

module.exports = {
  evaluateFarmBrain
};