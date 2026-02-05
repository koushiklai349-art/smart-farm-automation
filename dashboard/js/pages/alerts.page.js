// dashboard/js/pages/alerts.page.js

import { getAlertCounts } from "../components/alert.counter.js";

// alert.list.js এই state maintain করে (global)
const alertState = {
  alerts: []
};

function renderAlerts() {
  const container = document.getElementById("alerts-root");
  if (!container) return;

  if (!alertState.alerts.length) {
    container.innerHTML = `
      <p class="empty">No active alerts</p>
    `;
    return;
  }

  container.innerHTML = `
    <ul class="alert-list">
      ${alertState.alerts.map(a => `
        <li class="alert ${a.severity}">
          <div class="alert-main">
            <strong>[${a.severity.toUpperCase()}]</strong>
            ${a.message}
          </div>

          <div class="alert-meta">
            ${
              a.count && a.count > 1
                ? `<span class="count">×${a.count}</span>`
                : ""
            }
            <span class="time">
              ${new Date(a.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </li>
      `).join("")}
    </ul>
  `;
}

function syncFromGlobalAlertList() {
  // alert.list.js global state রাখে
  if (window.__ALERT_STATE__?.alerts) {
    alertState.alerts = window.__ALERT_STATE__.alerts;
  }
  renderAlerts();
}

export function AlertsPage() {
  // initial render shell
  setTimeout(syncFromGlobalAlertList, 0);

  // re-render on alert updates
  window.addEventListener("ALERT_STATE_UPDATED", syncFromGlobalAlertList);

  return `
    <section class="page">
      <h1>🚨 Alerts</h1>
      <div id="alerts-root"></div>
    </section>
  `;
}
