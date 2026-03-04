const { runtime } = require("../../store/runtime.store");
const { evaluateSeverity } = require("../severity/severity.engine");
const { generateIncidentSummary } = require("../summary/incident.summary.engine");

function createIncident({ type, deviceId, details }) {

  runtime.incidents = runtime.incidents || {
    lastId: 0,
    history: []
  };

  runtime.incidents.lastId += 1;

  const severity = evaluateSeverity({ type, details });

  let incident = {
    id: runtime.incidents.lastId,
    type,
    severity,
    deviceId,
    details,
    season: runtime.season?.current,
    energyUsage: runtime.energy?.todayUsage,
    reliability:
      runtime.caches?.analytics?.ranking
        ?.deviceReliability?.[deviceId] ?? null,
    createdAt: new Date().toISOString()
  };

  // 🔥 NEW: Add AI Summary
  incident.summary = generateIncidentSummary(incident);

  runtime.incidents.history.push(incident);

  if (runtime.incidents.history.length > 200)
    runtime.incidents.history.shift();

  console.log("[INCIDENT CREATED]", incident);

  return incident;
}

module.exports = {
  createIncident
};