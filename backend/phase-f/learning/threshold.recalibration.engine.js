const { persistent } = require("../../store/persistent.store");
const { runtime } = require("../../store/runtime.store");
const { savePersistent } = require("../../store/persistent.store");

function recalibrateThreshold(deviceId) {

  const history =
    runtime.caches.analytics.historical.telemetry?.[deviceId];

  if (!history || history.length < 30) return;

  const temps =
    history.slice(-50)
           .map(h => h.temperature)
           .filter(v => v !== null);

  if (temps.length < 30) return;

  const avgTemp =
    temps.reduce((a, b) => a + b, 0) / temps.length;

  const rules = persistent.rules || [];

  for (let rule of rules) {

    if (rule.deviceId !== deviceId) continue;
    if (!rule.sensor || rule.baseHighThreshold == null) continue;

    const diff =
      avgTemp - rule.baseHighThreshold;

    // gradual learning adjustment
    if (diff > 5) {
      rule.baseHighThreshold += 1;
    }
    else if (diff < -5) {
      rule.baseHighThreshold -= 1;
    }
  }

  savePersistent();
}

module.exports = {
  recalibrateThreshold
};