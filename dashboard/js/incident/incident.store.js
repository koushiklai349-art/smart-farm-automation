// js/incident/incident.store.js

const _activeIncidents = new Map();
const _resolvedIncidents = [];

export function getActiveIncidents() {
  return Array.from(_activeIncidents.values());
}

export function getIncidentByKey(key) {
  return _activeIncidents.get(key);
}

export function saveIncident(key, incident) {
  _activeIncidents.set(key, incident);
}

export function resolveIncident(key) {
  const incident = _activeIncidents.get(key);
  if (!incident) return;

  incident.state = "RESOLVED";
  incident.resolvedAt = Date.now();

  _resolvedIncidents.push(incident);
  _activeIncidents.delete(key);
}

export function getResolvedIncidents() {
  return _resolvedIncidents;
}

// js/incident/incident.store.js

export function getActiveIncidentEntries() {
  return Array.from(_activeIncidents.entries());
}
