// js/ui/stability/stability.template.js

export function renderStabilityRow(stability) {
  return `
    <div class="stability-row ${stability.state}">
      <strong>${stability.deviceId}</strong>
      <span>Score: ${stability.score}</span>
      <span>Status: ${stability.state}</span>
    </div>
  `;
}
