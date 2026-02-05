// js/explain/explain.summary.generator.js

import { ROOT_CAUSE_CONFIDENCE } from "./explain.types.js";

export function generateSummary({ incident, blast, stabilityBefore, stabilityAfter }) {
  const confidence =
    incident.events.length >= 3
      ? ROOT_CAUSE_CONFIDENCE.HIGH
      : ROOT_CAUSE_CONFIDENCE.MEDIUM;

  return {
    title: `Incident on ${incident.deviceId}`,
    rootCause: incident.suspectedRootCause,
    confidence,
    impact: blast?.affected || [],
    stabilityImpact: {
      before: stabilityBefore,
      after: stabilityAfter,
    },
    text: `
Root cause was identified as ${incident.suspectedRootCause}.
This affected ${blast?.affected?.length || 0} components.
Device stability changed from ${stabilityBefore?.state} to ${stabilityAfter?.state}.
`.trim(),
  };
}
