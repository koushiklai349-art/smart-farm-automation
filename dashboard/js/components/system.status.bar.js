// dashboard/js/components/system.status.bar.js
import { getSystemMode } from "../recovery/recovery.state.js";

let container;

export function initSystemStatusBar(root = document.body) {
  container = document.createElement("div");
  container.id = "system-status-bar";
  container.className = "system-status-bar";

  root.prepend(container);
}

export function renderSystemStatusBar(status) {
  if (!container) return;

  container.innerHTML = `
    <div class="status-item trust">
      🧠 Operator Trust:
      <strong>${status.trust || "—"}</strong>
    </div>

    <div class="status-item">
      <span>🟢 Mode: ${getSystemMode() ?? "—"}</span>
    </div>

    <div class="status-item ${status.health === "CRITICAL" ? "critical" : ""}">
      ❤️ Health: ${status.health || "—"}
    </div>

    <div class="status-item">
      ⚡ Power: ${status.power || "—"}
    </div>

    <div class="status-item">
      🌐 Network: ${status.network || "—"}
    </div>

    <div class="status-item">
      🎯 Confidence: ${status.confidence || "—"}
    </div>

    <div class="status-item muted">
      ⏱ Updated: ${status.updated || "—"}
    </div>
  `;
}

export function updateSystemStatusFromStore(store) {
  if (!store) return;

  renderSystemStatusBar({
    trust: store.operator?.trust ?? "—",
    mode: getSystemMode() ?? "—",
    health: store.system?.health ?? "—",
    power: store.power ?? "—",
    network: store.network ?? "—",
    confidence: store.system?.confidence ?? "—",
    updated: new Date().toLocaleTimeString()
  });
}
