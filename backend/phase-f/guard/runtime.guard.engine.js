const { runtime } = require("../../store/runtime.store");

function enforceMemoryLimits() {

  // 🔹 Arbitration history cap
  if (runtime.arbitrationHistory?.length > 1000) {
    runtime.arbitrationHistory =
      runtime.arbitrationHistory.slice(-500);
    console.log("🧹 Arbitration history trimmed");
  }

  // 🔹 Alerts cap
  if (runtime.alerts?.length > 500) {
    runtime.alerts =
      runtime.alerts.slice(-250);
    console.log("🧹 Alerts trimmed");
  }

  // 🔹 Incident history cap
  if (runtime.incidents?.history?.length > 500) {
    runtime.incidents.history =
      runtime.incidents.history.slice(-250);
    console.log("🧹 Incidents trimmed");
  }

  // 🔹 Telemetry cap per device
  const historical =
    runtime.caches?.analytics?.historical?.telemetry;

  if (historical) {
    Object.keys(historical).forEach(deviceId => {
      if (historical[deviceId].length > 1000) {
        historical[deviceId] =
          historical[deviceId].slice(-500);
        console.log("🧹 Telemetry trimmed:", deviceId);
      }
    });
  }
}

module.exports = {
  enforceMemoryLimits
};