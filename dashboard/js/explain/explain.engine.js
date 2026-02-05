// js/explain/explain.engine.js

import { buildExplainTimeline } from "./explain.timeline.builder.js";
import { generateSummary } from "./explain.summary.generator.js";

export function explainIncident({
  incident,
  blast,
  stabilityBefore,
  stabilityAfter,
  recoveryEvents = [],
}) {
  if (!incident) return null;

  const timeline = buildExplainTimeline({ incident, recoveryEvents });
  const summary = generateSummary({
    incident,
    blast,
    stabilityBefore,
    stabilityAfter,
  });

  return {
    incidentId: incident.id,
    deviceId: incident.deviceId,
    timeline,
    summary,
    createdAt: Date.now(),
  };
}
