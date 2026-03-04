const { runtime } = require("../../store/runtime.store");

function evaluatePredictiveRisk(deviceId) {

  const telemetry = runtime.telemetry?.[deviceId];
  const health = runtime.health?.devices?.[deviceId] ?? 100;

  const historyRaw =
    runtime.caches.analytics.historical.telemetry?.[deviceId];

  if (!telemetry || !historyRaw || historyRaw.length < 5)
    return 0;

  let risk = 0;

  // ================================
  // 1️⃣ HEALTH FACTOR
  // ================================
  risk += (100 - health) * 0.4;

  // ================================
  // 2️⃣ SENSOR INSTABILITY (VARIANCE)
  // ================================
  const temperatures =
    historyRaw.map(h => h.temperature)
              .filter(v => v !== null);

  if (temperatures.length >= 5) {

    const avg =
      temperatures.reduce((a, b) => a + b, 0) /
      temperatures.length;

    const variance =
      temperatures.reduce((sum, v) =>
        sum + Math.pow(v - avg, 2), 0) /
      temperatures.length;

    if (variance > avg * 0.3) {
      risk += 20;
    }
  }

  // ================================
  // 3️⃣ EXTREME ABSOLUTE VALUES
  // ================================
  const latestTemp =
    telemetry?.sensors?.temperature;

  if (latestTemp !== null && latestTemp !== undefined) {

    if (latestTemp > 50) {
      risk += 30;
    }

    if (latestTemp > 70) {
      risk += 20;
    }
  }

  // ================================
  // 4️⃣ RULE TRIGGER FREQUENCY
  // ================================
  const cooldown =
    runtime.commandCooldown?.[deviceId] || {};

  const triggerCount =
    Object.keys(cooldown).length;

  if (triggerCount > 3) {
    risk += 15;
  }

  if (risk > 100) risk = 100;

  runtime.predictive = runtime.predictive || { devices: {} };
  runtime.predictive.devices =
    runtime.predictive.devices || {};

  runtime.predictive.devices[deviceId] =
    Math.round(risk);

  return risk;
}

function evaluateRiskTrend(deviceId) {

  const history =
    runtime.caches.analytics.historical.risk?.[deviceId];

  if (!history || history.length < 5) return 0;

  const last5 =
    history.slice(-5).map(h => h.risk);

  let slope = 0;

  for (let i = 1; i < last5.length; i++) {
    slope += last5[i] - last5[i - 1];
  }

  return Math.round(slope / last5.length);
}

module.exports = {
  evaluatePredictiveRisk,
  evaluateRiskTrend
};