// js/ui/stability/stability.view.js

import { getAllStabilities } from "../stability/stability.store.js";
import { renderStabilityRow } from "./stability.template.js";
import { getAllTrust } from "../health/trust.store.js";

export function renderStabilityPanel(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const stabilities = getAllStabilities().map(([_, s]) => s);

  container.innerHTML = `
    <h3>📊 Device Stability</h3>
    ${stabilities.map(renderStabilityRow).join("")}
    ${renderTrustTrend()}

  `;
}

export function renderTrustTrend() {
  const trust = getAllTrust();

  return `
    <div class="card">
      <h3>🔐 Device Trust</h3>
      <ul>
        ${trust
          .map(
            t => `
          <li>
            ${t.deviceId} —
            <strong>${Math.round(t.score)}</strong>
          </li>
        `
          )
          .join("")}
      </ul>
    </div>
  `;
}
