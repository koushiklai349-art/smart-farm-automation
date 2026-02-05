// js/ui/incident/incident.view.js

import { getActiveIncidents } from "../incident/incident.store.js";
import { renderIncidentCard } from "./incident.template.js";
import { showExplain } from "../ui/explain/explain.view.js";
import { getExplanationForIncident } from "../explain/explain.store.js";

export function renderIncidentPanel(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const incidents = getActiveIncidents();

  container.innerHTML = `
    <h3>🚨 Active Incidents</h3>
    ${incidents.map(renderIncidentCard).join("")}
  `;
}

window.showIncidentExplain = function (incidentId) {
  const explain = getExplanationForIncident(incidentId);
  showExplain(explain);
};
