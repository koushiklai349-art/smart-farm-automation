const { runtime } = require("../../store/runtime.store");

function recordTelemetryHistory(deviceId, sensors) {

  const hist =
    runtime.caches.analytics.historical.telemetry;

  hist[deviceId] = hist[deviceId] || [];

  hist[deviceId].push({
    at: Date.now(),
    temperature: sensors.temperature,
    humidity: sensors.humidity,
    soil: sensors.soil_moisture
  });

  // Keep last 100 records
  if (hist[deviceId].length > 100) {
    hist[deviceId].shift();
  }
}

function recordHealthHistory(deviceId) {
  const risk =
  runtime.predictive.devices?.[deviceId];

if (risk === undefined || risk === null) return;

  const hist =
    runtime.caches.analytics.historical.health;

  hist[deviceId] = hist[deviceId] || [];

  const score =
    runtime.health.devices?.[deviceId];

  if (score === undefined) return;

  hist[deviceId].push({
    at: Date.now(),
    score
  });

  if (hist[deviceId].length > 100) {
    hist[deviceId].shift();
  }
}

function recordRiskHistory(deviceId) {

  runtime.caches = runtime.caches || {};
  runtime.caches.analytics = runtime.caches.analytics || {};
  runtime.caches.analytics.historical =
    runtime.caches.analytics.historical || {};
  runtime.caches.analytics.historical.risk =
    runtime.caches.analytics.historical.risk || {};

  const hist =
    runtime.caches.analytics.historical.risk;

  hist[deviceId] = hist[deviceId] || [];

  const risk =
    runtime.predictive?.devices?.[deviceId];

  if (risk === undefined || risk === null) return;

  hist[deviceId].push({
    at: Date.now(),
    risk
  });

  if (hist[deviceId].length > 100) {
    hist[deviceId].shift();
  }
}

module.exports = {
  recordTelemetryHistory,
  recordHealthHistory,
  recordRiskHistory
};