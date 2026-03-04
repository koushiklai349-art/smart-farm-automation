const { runtime } = require("../store/runtime.store");

function createIncident({ type, deviceId, severity, message }) {

  runtime.incidents = runtime.incidents || {};
  runtime.incidents.history = runtime.incidents.history || [];

  const id = ++runtime.incidents.lastId;

  const incident = {
    id,
    type,
    deviceId,
    severity,
    message,
    status: "OPEN",
    createdAt: new Date().toISOString(),
    escalated: false
  };

  runtime.incidents.history.push(incident);

  console.log("🚨 INCIDENT CREATED:", incident);

  return incident;
}

function resolveIncident(deviceId, type) {

  const incident = runtime.incidents.history.find(
    i => i.deviceId === deviceId && i.type === type && i.status === "OPEN"
  );

  if (!incident) return;

  incident.status = "RESOLVED";
  incident.resolvedAt = new Date().toISOString();

  console.log("✅ INCIDENT RESOLVED:", incident.id);

  return incident;
}

function escalateIncident(deviceId, type) {

  const incident = runtime.incidents.history.find(
    i => i.deviceId === deviceId && i.type === type && i.status === "OPEN"
  );

  if (!incident || incident.escalated) return;

  incident.escalated = true;
  incident.escalatedAt = new Date().toISOString();

  console.log("🔥 INCIDENT ESCALATED:", incident.id);
}

module.exports = {
  createIncident,
  resolveIncident,
  escalateIncident
};