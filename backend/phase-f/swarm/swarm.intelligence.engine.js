const { runtime } = require("../../store/runtime.store");

async function evaluateSwarmIntelligence(dispatchCommand) {

  const telemetryMap = runtime.telemetry || {};
  const deviceIds = Object.keys(telemetryMap);

  if (deviceIds.length < 2) return;

  const temps = deviceIds
    .map(id => telemetryMap[id]?.sensors?.temperature)
    .filter(v => v != null);

  if (temps.length < 2) return;

  const avg =
    temps.reduce((a, b) => a + b, 0) / temps.length;

  const GLOBAL_HEAT_THRESHOLD = 85;

  // 🔥 Absolute global heat detection
  const allHot =
    temps.every(t => t >= GLOBAL_HEAT_THRESHOLD);

  if (allHot) {

    console.log("[SWARM ALERT] Absolute global heat detected");

    for (let id of deviceIds) {
      try {
        await dispatchCommand({
         commandId: Date.now().toString(),
         deviceId: id,
         action: "FAN_ON",
         issuedAt: new Date().toISOString(),
         reason: "SWARM_GLOBAL_COOLING",
         source: "SYSTEM_AI",
         role: "SYSTEM"
       });
      } catch (err) {
        console.error("Swarm dispatch failed", err.message);
      }
    }
  }

  // 🔍 Outlier detection
  for (let id of deviceIds) {

    const temp =
      telemetryMap[id]?.sensors?.temperature;

    if (temp == null) continue;

    if (Math.abs(temp - avg) > 15) {

      console.log("[SWARM OUTLIER]", id);

      runtime.alerts = runtime.alerts || [];
      runtime.alerts.push({
        type: "SWARM_OUTLIER",
        deviceId: id,
        at: new Date().toISOString()
      });
    }
  }
}

module.exports = {
  evaluateSwarmIntelligence
};