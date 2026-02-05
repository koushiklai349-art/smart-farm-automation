// js/incident/incident.builder.js
import { INCIDENT_STATE } from "./incident.types.js";

export function buildIncident(event) {
  return {
    id: `INC-${Date.now()}`,
    key: buildIncidentKey(event),
    state: INCIDENT_STATE.OPEN,

    deviceId: event.deviceId,
    controllerId: event.controllerId,
    capability: event.capability,

    events: [event],
    createdAt: Date.now(),
    updatedAt: Date.now(),

    suspectedRootCause: event.type,
    severity: "MEDIUM",
  };
}

export function appendEventToIncident(incident, event) {
  incident.events.push(event);
  incident.updatedAt = Date.now();
}

export function buildIncidentKey(event) {
  return `${event.deviceId}|${event.capability}`;
}
