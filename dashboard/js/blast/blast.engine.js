// js/blast/blast.engine.js

import { BLAST_GRAPH } from "./blast.graph.js";
import { BLAST_SEVERITY } from "./blast.types.js";

export function calculateBlastRadius(incident) {
  if (!incident) return null;

  const primary =
    incident.deviceId || incident.capability;

  const node = BLAST_GRAPH[primary];

  if (!node) {
    return {
      incidentId: incident.id,
      primary,
      affected: [],
      severity: BLAST_SEVERITY.LOW,
    };
  }

  return {
    incidentId: incident.id,
    primary,
    affected: node.affects || [],
    severity: node.severity || BLAST_SEVERITY.MEDIUM,
  };
}
