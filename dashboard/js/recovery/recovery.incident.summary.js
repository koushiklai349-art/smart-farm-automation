import { correlateRecoveryIncidents } 
  from "./recovery.timeline.correlation.js";
import { getFilteredRecoveryTimeline } 
  from "./recovery.timeline.store.js";
/**
 * TASK-144.1
 * Build human-readable incident summary
 */

export function buildIncidentSummary(incident) {
  if (!incident || !Array.isArray(incident.events)) {
    return "";
  }

  const device = incident.deviceId || "Unknown device";
  const retries = incident.retryCount || 0;

  let slaLevel = null;
  let hadQuarantine = false;
  let hadManualRelease = false;

  for (const e of incident.events) {
    if (e.type === "SLA_BREACH" && e.meta?.level) {
      slaLevel = e.meta.level;
    }
    if (e.type === "QUARANTINED") {
      hadQuarantine = true;
    }
    if (e.type === "MANUAL_RELEASE") {
      hadManualRelease = true;
    }
  }

  const parts = [];

  // start
  parts.push(`${device} encountered a failure`);

  // retries
  if (retries > 0) {
    parts.push(`${retries} retry attempt${retries > 1 ? "s" : ""}`);
  }

  // quarantine
  if (hadQuarantine) {
    parts.push(`was quarantined`);
  }

  // SLA
  if (slaLevel) {
    parts.push(`SLA breached (${slaLevel})`);
  }

  // end state
  if (incident.status === "RECOVERED") {
    if (incident.durationMs != null) {
      const sec = Math.round(incident.durationMs / 1000);
      parts.push(`and recovered in ${sec}s`);
    } else {
      parts.push(`and recovered successfully`);
    }
  } else if (incident.status === "MANUAL_RELEASE") {
    parts.push(`and was manually released by operator`);
  } else if (incident.status === "OPEN") {
    parts.push(`and recovery is still in progress`);
  }

  return parts.join(", ") + ".";
}

export function renderRecoveryMiniInsight(container, hours = 24) {
  if (!container) return;

  // get recent recovery events
  const timeline = getFilteredRecoveryTimeline({
    sinceMs: Date.now() - hours * 60 * 60 * 1000
  });

  if (!timeline || timeline.length === 0) {
    container.innerHTML = `
      <div class="card">
        ✅ No recovery incidents in last ${hours}h
      </div>
    `;
    return;
  }

  const incidents = correlateRecoveryIncidents(timeline);

  if (!incidents || incidents.length === 0) {
    container.innerHTML = `
      <div class="card">
        ✅ No recovery incidents in last ${hours}h
      </div>
    `;
    return;
  }

  const top = incidents[0];
  const summary = buildIncidentSummary(top);

  container.innerHTML = `
    <div class="card">
      <h3>🧠 Recovery Insight (${hours}h)</h3>
      <p>${summary}</p>
      <p>
        🔁 Retries: ${top.retryCount || 0}
        · ⏱ ${top.durationMs != null ? Math.round(top.durationMs / 1000) + "s" : "ongoing"}
        · ⚠️ ${top.status}
      </p>
      <a href="#history">View full recovery timeline →</a>
    </div>
  `;
}

// expose for overview/router
window.renderRecoveryMiniInsight = renderRecoveryMiniInsight;
