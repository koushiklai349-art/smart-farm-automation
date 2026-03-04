const { runtime } = require("../../store/runtime.store");

function recordSensor(deviceId, sensors) {

  runtime.caches.analytics.sensorHistory =
    runtime.caches.analytics.sensorHistory || {};

  runtime.caches.analytics.sensorHistory[deviceId] =
    runtime.caches.analytics.sensorHistory[deviceId] || {
      temperature: [],
      humidity: [],
      soil_moisture: []
    };

  const history =
    runtime.caches.analytics.sensorHistory[deviceId];

  ["temperature", "humidity", "soil_moisture"].forEach(key => {

    if (typeof sensors[key] === "number") {

      history[key].push(sensors[key]);

      if (history[key].length > 10) {
        history[key].shift(); // keep last 10 values
      }
    }
  });
}

function detectAnomaly(deviceId) {

  const history =
    runtime.caches.analytics.sensorHistory?.[deviceId];

  if (!history) return false;

  let anomalyDetected = false;

  Object.keys(history).forEach(key => {

    const values = history[key];
    if (values.length < 5) return;

    const avg =
      values.reduce((a, b) => a + b, 0) / values.length;

    const latest = values[values.length - 1];

    const deviation = Math.abs(latest - avg);

    if (deviation > avg * 0.5) { // 50% sudden jump
      anomalyDetected = true;
    }
  });

  return anomalyDetected;
}

module.exports = {
  recordSensor,
  detectAnomaly
};