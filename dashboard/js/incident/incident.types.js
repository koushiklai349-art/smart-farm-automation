// js/incident/incident.types.js

export const INCIDENT_STATE = {
  OPEN: "OPEN",
  INVESTIGATING: "INVESTIGATING",
  MITIGATED: "MITIGATED",
  RESOLVED: "RESOLVED",
};

export const INCIDENT_SEVERITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
};

export const CORRELATION_WINDOW_MS = 90 * 1000; // 90 sec
// js/incident/incident.types.js

export const AUTO_RESOLVE_AFTER_MS = 3 * 60 * 1000; // 3 min
