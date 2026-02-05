// js/ui/incident/incident.template.js

export function renderIncidentCard(incident) {
  return `
    <div class="incident-card ${incident.state}">
      <h4>${incident.id}</h4>
      <p>Device: ${incident.deviceId}</p>
      <p>Capability: ${incident.capability}</p>
      <button
        onclick="window.showIncidentExplain('${incident.id}')">
       🤔 Why?
      </button>
      <p>Events: ${incident.events.length}</p>
    </div>
  `;
}
