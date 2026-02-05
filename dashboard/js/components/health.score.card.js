import { getSystemMode } from "../recovery/recovery.state.js";

export function renderHealthScore(container, score) {
  if (!container || typeof score !== "number") return;

  let status = "ok";
  let icon = "🟢";

  if (score < 40) {
    status = "critical";
    icon = "🔴";
  } else if (score < 70) {
    status = "warning";
    icon = "🟡";
  }

  const mode = getSystemMode?.() || "UNKNOWN";

  container.innerHTML = `
    <div class="health-score-card ${status}">
      <div class="health-title">🩺 SYSTEM HEALTH</div>

      <div class="health-score">${score}</div>

      <div class="health-status">
        ${icon} ${status.toUpperCase()}
      </div>

      <div class="health-mode">
        Mode: <b>${mode}</b>
      </div>
    </div>
  `;
}
