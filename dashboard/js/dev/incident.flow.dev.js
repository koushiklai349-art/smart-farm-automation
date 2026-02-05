// js/dev/incident.flow.dev.js

import { ingestEvent } from "../incident/incident.engine.js";
import { calculateBlastRadius } from "../blast/blast.engine.js";
import { penalize } from "../stability/stability.engine.js";
import { explainIncident } from "../explain/explain.engine.js";
import { getStability } from "../stability/stability.store.js";
import { evaluateRisk } from "../prediction/prediction.engine.js";

/**
 * DEV helper:
 * Event → Incident → Blast
 */
export function devIngestEvent(event) {
  const before = getStability(event.deviceId);

  const incident = ingestEvent(event);

  if (window.refreshIncidentStabilityUI) {
  window.refreshIncidentStabilityUI();
  }
  
  const blast = calculateBlastRadius(incident);
  
  penalize(incident.deviceId, 15);
  
  const after = getStability(event.deviceId);

  const explanation = explainIncident({
    incident,
    blast,
    stabilityBefore: before,
    stabilityAfter: after,
  });
  
  const prediction = evaluateRisk({
  deviceId: incident.deviceId,
  stabilityHistory: [getStability(incident.deviceId)],
  incidentHistory: incident.events,
  });

  console.log("🧠 Incident created:", incident);
  console.log("💥 Blast Radius:", blast);
  console.log("🧠 EXPLANATION:", explanation);
  console.log("⚠️ PREDICTION:", prediction);
  
  return { incident, blast, explanation };
}
