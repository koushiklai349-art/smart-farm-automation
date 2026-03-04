const { runtime } = require("../../store/runtime.store");

function evaluateDeviceReliability(deviceId) {

  const health = runtime.health?.devices?.[deviceId] ?? 100;
  const risk = runtime.predictive?.devices?.[deviceId] ?? 0;
  const escalation =
    runtime.escalation?.devices?.[deviceId]?.level ?? 0;

  let score = 100;

  score -= (100 - health) * 0.5;
  score -= risk * 0.3;
  score -= escalation * 10;

  if (score < 0) score = 0;
  if (score > 100) score = 100;

  runtime.caches.analytics.ranking.deviceReliability[deviceId] =
    Math.round(score);

  return score;
}

function evaluateFarmEfficiency() {

  const devices =
    runtime.caches.analytics.ranking.deviceReliability;

  const values = Object.values(devices);

  if (!values.length) return 100;

  const avg =
    values.reduce((a, b) => a + b, 0) / values.length;

  runtime.caches.analytics.ranking.farmEfficiency =
    Math.round(avg);

  return avg;
}

module.exports = {
  evaluateDeviceReliability,
  evaluateFarmEfficiency
};