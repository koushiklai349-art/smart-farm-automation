/**
 * TASK-145.1
 * Compute severity level + confidence score for an incident
 */

export function computeIncidentScore(incident) {
  if (!incident) {
    return { severity: "UNKNOWN", confidence: 0 };
  }

  let severityScore = 0;
  let confidence = 100;

  // retries impact
  if (incident.retryCount >= 3) {
    severityScore += 2;
    confidence -= 20;
  } else if (incident.retryCount > 0) {
    severityScore += 1;
    confidence -= 10;
  }

  // duration impact
  if (incident.durationMs != null) {
    const sec = incident.durationMs / 1000;
    if (sec > 120) {
      severityScore += 2;
      confidence -= 20;
    } else if (sec > 60) {
      severityScore += 1;
      confidence -= 10;
    }
  }

  // SLA breach impact
  const slaEvent = incident.events?.find(
    e => e.type === "SLA_BREACH"
  );
  if (slaEvent) {
    severityScore += slaEvent.meta?.level === "critical" ? 3 : 2;
    confidence -= 30;
  }

  // open incident
  if (incident.status === "OPEN") {
    severityScore += 2;
    confidence -= 30;
  }

  const severity =
    severityScore >= 6
      ? "CRITICAL"
      : severityScore >= 4
      ? "HIGH"
      : severityScore >= 2
      ? "MEDIUM"
      : "LOW";

  return {
    severity,
    confidence: Math.max(0, Math.min(100, confidence))
  };
}
