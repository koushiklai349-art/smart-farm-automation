const { runtime } = require("../../store/runtime.store");

function runChaosTest(type = "HEAT_SPIKE") {

  const devices = Object.keys(runtime.devices || {});
  if (!devices.length) return;

  console.log("💥 CHAOS TEST TRIGGERED:", type);

  devices.forEach(deviceId => {

    runtime.telemetry = runtime.telemetry || {};
    runtime.telemetry[deviceId] =
      runtime.telemetry[deviceId] || { sensors: {} };

    switch (type) {

      case "HEAT_SPIKE":
        runtime.telemetry[deviceId].sensors.temperature = 95;
        break;

      case "COLD_DROP":
        runtime.telemetry[deviceId].sensors.temperature = 5;
        break;

      case "ENERGY_OVERLOAD":
        runtime.energy.todayUsage =
          runtime.energy.dailyLimit + 500;
        break;

      case "DEVICE_OFFLINE":
        runtime.devices[deviceId].status = "OFFLINE";
        break;

      case "TELEMETRY_FLOOD":
        runtime.metrics.telemetryCount =
          (runtime.metrics.telemetryCount || 0) + 2000;
        break;

      default:
        break;
    }
  });

  console.log("⚡ Chaos simulation applied");
}

module.exports = {
  runChaosTest
};