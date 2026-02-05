/**
 * TASK-147.1
 * Build actionable recommendations for an incident
 */

export function buildIncidentRecommendations(incident) {
  if (!incident) return [];

  const recs = [];

  const retries = incident.retryCount || 0;
  const durationSec =
    incident.durationMs != null
      ? incident.durationMs / 1000
      : null;

  const hasSlaBreach = incident.events?.some(
    e => e.type === "SLA_BREACH"
  );

  const hasQuarantine = incident.events?.some(
    e => e.type === "QUARANTINED"
  );

  // retry-heavy incidents
  if (retries >= 3) {
    recs.push(
      "High retry count detected. Consider tuning retry policy or backoff strategy."
    );
  }

  // slow recovery
  if (durationSec != null && durationSec > 60) {
    recs.push(
      "Recovery time is high. Investigate device responsiveness or network latency."
    );
  }

  // SLA breach
  if (hasSlaBreach) {
    recs.push(
      "SLA breach occurred. Review recovery timeout thresholds and escalation rules."
    );
  }

  // quarantine path
  if (hasQuarantine) {
    recs.push(
      "Device was quarantined. Perform health check before re-enabling automation."
    );
  }

  // open incidents
  if (incident.status === "OPEN") {
    recs.push(
      "Incident is still open. Monitor closely or consider manual intervention."
    );
  }

  // fallback
  if (recs.length === 0) {
    recs.push(
      "No immediate action required. Monitor system for recurrence."
    );
  }

  return recs.slice(0, 3); // keep it concise
}
