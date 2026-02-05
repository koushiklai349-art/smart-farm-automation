// js/incident/incident.engine.js

import { getIncidentByKey,saveIncident,resolveIncident,getActiveIncidentEntries, } from "./incident.store.js";

import { buildIncident,appendEventToIncident,buildIncidentKey, } from "./incident.builder.js";

import { CORRELATION_WINDOW_MS,AUTO_RESOLVE_AFTER_MS, } from "./incident.types.js";
import { reward } from "../stability/stability.engine.js";
 
const DEV_MODE = true;

export function ingestEvent(event) {
  const key = buildIncidentKey(event);
  const existing = getIncidentByKey(key);

  if (!existing) {
    const incident = buildIncident(event);
    saveIncident(key, incident);
    return incident;
  }

  const isWithinWindow =
    Date.now() - existing.updatedAt < CORRELATION_WINDOW_MS;

  if (isWithinWindow) {
    appendEventToIncident(existing, event);
    return existing;
  }

  // window expired → new incident
  const incident = buildIncident(event);
  saveIncident(key, incident);
  return incident;
}

export function autoResolveTick() {
  if (!DEV_MODE) return;

  const now = Date.now();

  for (const [key, incident] of getActiveIncidentEntries()) {
    const idleTime = now - incident.updatedAt;

    if (idleTime > AUTO_RESOLVE_AFTER_MS) {
      resolveIncident(key);
      // 🔺 Stability reward on recovery
      reward(incident.deviceId, 5);
      console.log("🟢 Incident auto-resolved:", incident.id);
    }
  }
}
