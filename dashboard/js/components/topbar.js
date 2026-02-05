import { getActiveFarm } from "../farm/farm.info.js";
import { loadPage } from "../router.js";
import { store } from "../store.js";

let topbarRaf = null;
function safeReloadTopbar() {
  if (topbarRaf) return;
  topbarRaf = requestAnimationFrame(() => {
    topbarRaf = null;
    loadTopbar();
  });
}


function getAlertSummary() {
  if (!Array.isArray(store.alerts)) {
    return { critical: 0, warning: 0 };
  }

  let critical = 0;
  let warning = 0;

  store.alerts.forEach(a => {
    if (a.type === "critical") critical++;
    if (a.type === "warning") warning++;
  });

  return { critical, warning };
}

export function loadTopbar() {
  const topbar = document.getElementById("topbar");
  const farm = getActiveFarm();
  const alerts = getAlertSummary();

  const alertUI =
    alerts.critical || alerts.warning
      ? `
        <div class="topbar-alerts">
          ${alerts.critical ? `🚨 ${alerts.critical} Critical` : ""}
          ${alerts.warning ? ` ⚠️ ${alerts.warning} Warning` : ""}
        </div>
      `
      : `<div class="topbar-alerts ok">✅ No Alerts</div>`;

  const farmUI = farm
    ? `
      <div style="display:flex;align-items:center;gap:8px;">
        <strong>${farm.name}</strong>
        <button id="switch-farm-btn">Switch Farm</button>
      </div>
    `
    : `<strong>No Farm Selected</strong>`;

  topbar.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
      <h3>🌾 Smart Farm Dashboard</h3>

      ${alertUI}

      ${farmUI}

      <div id="engine-heartbeat" style="display:flex;gap:6px;"></div>
    </div>
  `;

  const btn = document.getElementById("switch-farm-btn");
  if (btn) {
    btn.onclick = () => {
      loadPage("farms");
    };
  }
}

/* 🔁 Auto refresh rules */
window.addEventListener("farm:changed", safeReloadTopbar);
if (store.subscribe) {
  store.subscribe(safeReloadTopbar);
}

