import { getHealthHistory } from "../health/health.history.store.js";

const HEALTH_UI = {
  ok: { icon: "🟢", label: "OK" },
  warning: { icon: "🟡", label: "WARNING" },
  critical: { icon: "🔴", label: "CRITICAL" }
};

export function renderHealthTimeline(container) {
  if (!container) return;

  const history = getHealthHistory();

  if (!Array.isArray(history) || history.length === 0) {
    container.innerHTML = `
      <div class="health-empty">
        🩺 No health events yet
      </div>
    `;
    return;
  }

  // newest first
  const rows = [...history].reverse();

  container.innerHTML = `
    <div class="health-timeline">
      ${rows.map(renderItem).join("")}
    </div>
  `;
}

function renderItem(h) {
  const ui = HEALTH_UI[h.health] || {
    icon: "⚪",
    label: h.health || "UNKNOWN"
  };

  return `
    <div class="health-item health-${h.health}">
      <span class="health-icon">${ui.icon}</span>

      <div class="health-info">
        <div class="health-label">
          ${ui.label}
        </div>
        <div class="health-time">
          ${h.time}
        </div>
      </div>
    </div>
  `;
}
