const { runtime } = require("../../store/runtime.store");

function evaluateConfidence(deviceId) {

  const risk =
    runtime.predictive?.devices?.[deviceId] ?? 0;

  const trendHistory =
    runtime.caches.analytics.historical.risk?.[deviceId] || [];

  let confidence = 0;

  // 1️⃣ Risk weight (40%)
  confidence += risk * 0.4;

  // 2️⃣ Trend stability (30%)
  if (trendHistory.length >= 5) {

    const last5 =
      trendHistory.slice(-5).map(r => r.risk);

    const changes =
      last5.slice(1).map((v, i) =>
        Math.abs(v - last5[i])
      );

    const avgChange =
      changes.reduce((a, b) => a + b, 0) /
      changes.length;

    if (avgChange < 5) {
      confidence += 30;
    }
    else {
      confidence += 10;
    }
  }

  // 3️⃣ Adaptive alignment (30%)
  const mode =
    runtime.adaptive?.devices?.[deviceId]?.mode;

  if (mode === "AGGRESSIVE" && risk >= 60) {
    confidence += 30;
  }
  else if (mode === "BALANCED") {
    confidence += 15;
  }

  if (confidence > 100) confidence = 100;

  runtime.confidence =
    runtime.confidence || { devices: {} };

  runtime.confidence.devices =
    runtime.confidence.devices || {};

  runtime.confidence.devices[deviceId] =
    Math.round(confidence);

  return confidence;
}

module.exports = {
  evaluateConfidence
};