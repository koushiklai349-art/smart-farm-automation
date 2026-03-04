const { runtime } = require("../../store/runtime.store");
const { getRules } = require("../../store/rule.store");

function autoTuneRules(deviceId) {

  const history =
    runtime.caches.analytics.sensorHistory?.[deviceId];

  if (!history) return;

  const rules = getRules();

  rules.forEach(rule => {

    if (!rule.autoTune) return;
    if (rule.deviceId !== deviceId) return;

    const values = history[rule.sensor];
    if (!values || values.length < 5) return;

    const avg =
      values.reduce((a, b) => a + b, 0) / values.length;

    const variance =
      values.reduce((sum, v) =>
        sum + Math.pow(v - avg, 2), 0) / values.length;

    const adaptiveHigh =
      Math.round(avg + Math.sqrt(variance));

    const adaptiveLow =
      Math.round(avg - Math.sqrt(variance));

    rule.highThreshold = adaptiveHigh;
    rule.lowThreshold = adaptiveLow;

    console.log(
      "[AUTO-TUNE]",
      deviceId,
      rule.sensor,
      "→",
      adaptiveLow,
      adaptiveHigh
    );
  });
}

module.exports = {
  autoTuneRules
};