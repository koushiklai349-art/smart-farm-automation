
const { runtime } = require("../../store/runtime.store");
const { evaluateRisk } = require("../../services/predictive.guard.service");
const { ensureFarmScope } = require("../../store/runtime.store");

function evaluateDeviceHealth(deviceId) {

  const telemetry = runtime.telemetry?.[deviceId];
  if (!telemetry) return;

  let score = 100;

  // 1️⃣ No telemetry recently → penalty
  const lastUpdated = new Date(telemetry.lastUpdated).getTime();
  if (Date.now() - lastUpdated > 30000) {
    score -= 30;
  }

  // 2️⃣ Too many commands sent
  const sent = runtime.metrics.commandsSent || 0;
  if (sent > 100) {
    score -= 10;
  }

  // 3️⃣ Abnormal sensor
  const temp = telemetry.sensors?.temperature;
  if (temp !== null && (temp < -10 || temp > 60)) {
    score -= 40;
  }

  if (score < 0) score = 0;

const farmId = runtime.devices?.[deviceId]?.farmId;
const farmScope = ensureFarmScope(farmId);

farmScope.health.devices[deviceId] = score;

// 🎯 Convert health score → risk score
const riskScore = 100 - score;

// 🔥 Call predictive guard
evaluateRisk(deviceId, riskScore)
  .catch(err =>
    console.error("Predictive guard error:", err.message)
  );

return score;
}

function evaluateFarmHealth(farmId) {

  const farmScope = ensureFarmScope(farmId);
  const scores = Object.values(farmScope.health.devices);

  if (!scores.length) return;

  const avg =
    scores.reduce((a, b) => a + b, 0) / scores.length;

  farmScope.health.farmScore = Math.round(avg);

  return farmScope.health.farmScore;
}

module.exports = {
  evaluateDeviceHealth,
  evaluateFarmHealth
};