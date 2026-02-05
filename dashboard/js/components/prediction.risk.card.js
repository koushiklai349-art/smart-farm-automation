// js/components/prediction.risk.card.js

import { getAllPredictions } from "../prediction/prediction.store.js";

function riskColor(risk) {
  if (risk === "HIGH") return "🔴";
  if (risk === "MEDIUM") return "🟠";
  return "🟢";
}

export function PredictionRiskCard() {
  const predictions = getAllPredictions().map(([_, p]) => p);

  if (predictions.length === 0) {
    return `<div class="card">🟢 No risk warnings</div>`;
  }

  return `
    <div class="card">
      <h3>⚠️ Early Risk Warnings</h3>
      <ul style="margin:0;padding-left:16px;">
        ${predictions.map(p => `
          <li>
            ${riskColor(p.risk)}
            <strong>${p.deviceId}</strong>
            — Risk: ${p.risk}
            ${p.signals?.length ? `(${p.signals.join(", ")})` : ""}
          </li>
        `).join("")}
      </ul>
    </div>
  `;
}
