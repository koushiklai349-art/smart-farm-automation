const { runtime } = require("../../store/runtime.store");

function learnFromHistory(deviceId) {

  const history =
    runtime.caches.analytics.historical.telemetry?.[deviceId];

  if (!history || history.length < 20) return;

  const temps = history.map(h => h.temperature).filter(Boolean);
  const soils = history.map(h => h.soil).filter(Boolean);

  if (temps.length) {

    const avgTemp =
      temps.reduce((a, b) => a + b, 0) / temps.length;

    // Dynamic fan threshold
    runtime.learning.thresholds.fanTempLow =
      Math.round(avgTemp - 3);
  }

  if (soils.length) {

    const avgSoil =
      soils.reduce((a, b) => a + b, 0) / soils.length;

    // Dynamic pump threshold
    runtime.learning.thresholds.pumpSoilHigh =
      Math.round(avgSoil + 10);
  }

  console.log(
    "[AI LEARNING UPDATED]",
    runtime.learning.thresholds
  );
}

module.exports = {
  learnFromHistory
};