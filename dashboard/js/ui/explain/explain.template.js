// js/ui/explain/explain.template.js

export function renderExplainContent(explain) {
  if (!explain) {
    return `<p>No explanation available</p>`;
  }

  return `
    <h3>🧠 Why did this incident happen?</h3>

    <p><strong>Device:</strong> ${explain.deviceId}</p>
    <p><strong>Incident ID:</strong> ${explain.incidentId}</p>

    <h4>🔍 Root Cause</h4>
    <p>${explain.summary.rootCause}</p>
    <p>Confidence: ${explain.summary.confidence}</p>

    <h4>💥 Impact</h4>
    <ul>
      ${explain.summary.impact.map(i => `<li>${i}</li>`).join("")}
    </ul>

    <h4>📉 Stability Change</h4>
    <p>
      ${explain.summary.stabilityImpact.before?.state || "N/A"}
      →
      ${explain.summary.stabilityImpact.after?.state || "N/A"}
    </p>

    <h4>⏱ Timeline</h4>
    <ul>
      ${explain.timeline.map(t => `
        <li>
          ${new Date(t.at).toLocaleTimeString()} — ${t.label}
        </li>
      `).join("")}
    </ul>
  `;
}
