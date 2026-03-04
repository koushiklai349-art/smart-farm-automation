const { runtime } = require("../../store/runtime.store");

function evaluateRuntimeHealth() {

  runtime.systemHealth = runtime.systemHealth || {};

  const arbitrationCount =
    runtime.arbitrationHistory?.length || 0;

  const alertCount =
    runtime.alerts?.length || 0;

  const incidentCount =
    runtime.incidents?.history?.length || 0;

  let healthScore = 100;

  // 🔹 Arbitration overload
  if (arbitrationCount > 800) {
    healthScore -= 20;
  }

  // 🔹 Alert flood
  if (alertCount > 400) {
    healthScore -= 20;
  }

  // 🔹 Incident spike
  if (incidentCount > 400) {
    healthScore -= 20;
  }

  // 🔹 Decision frequency overload
  const telemetryCount =
    runtime.metrics?.telemetryCount || 0;

  if (telemetryCount > 10000) {
    healthScore -= 20;
  }

  runtime.systemHealth.score = healthScore;
  runtime.systemHealth.lastChecked = Date.now();

  if (healthScore < 60) {
    console.log("⚠ SYSTEM HEALTH DEGRADED:", healthScore);
  }

  if (healthScore < 40) {
    console.log("🚨 SYSTEM HEALTH CRITICAL:", healthScore);
  }

  return healthScore;
}

module.exports = {
  evaluateRuntimeHealth
};