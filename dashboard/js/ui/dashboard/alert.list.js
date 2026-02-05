// js/ui/dashboard/alert.list.js
import { canViewAlert } from "../../system/rbac.guard.js";

console.log("[ALERT LIST] loaded");

const alertState = {
  alerts: loadAlertsFromStorage(),
};
// expose alert state for pages
window.__ALERT_STATE__ = alertState;

const ALERT_STORAGE_KEY = "dashboard.alerts.v1";

function loadAlertsFromStorage() {
  try {
    const raw = localStorage.getItem(ALERT_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch {
    return [];
  }
}

function saveAlertsToStorage(alerts) {
  try {
    localStorage.setItem(
      ALERT_STORAGE_KEY,
      JSON.stringify(alerts)
    );
  } catch {
    // ignore quota / storage errors
  }
}

function getRecentAlertStats(windowMs = 60 * 1000) {
  const now = Date.now();
  let warning = 0;
  let critical = 0;

  for (const a of alertState.alerts) {
    if (now - a.timestamp > windowMs) break;
    if (a.severity === "warning") warning++;
    if (a.severity === "critical") critical++;
  }

  return { warning, critical };
}

export function addAlert(alert) {
  // 🔐 RBAC: hide alerts user cannot view
   if (!canViewAlert(alert)) {
    return;
   }
  // 🔕 TASK-138: merge grouped alerts
  if (alert.key) {
    const existing = alertState.alerts.find(
      a => a.key === alert.key
    );

    if (existing) {
      // update existing alert instead of pushing new
      existing.count = alert.count || existing.count || 1;
      existing.lastAt = alert.lastAt || Date.now();
      existing.timestamp = Date.now();

      window.dispatchEvent(
        new CustomEvent("ALERT_STATE_UPDATED")
      );
      return;
    }
  }

  // new alert
  alertState.alerts.unshift(alert);

  if (alertState.alerts.length > 100) {
    alertState.alerts.pop();
  }

  window.dispatchEvent(
    new CustomEvent("ALERT_STATE_UPDATED")
  );
  saveAlertsToStorage(alertState.alerts);

  const stats = getRecentAlertStats();
window.dispatchEvent(
  new CustomEvent("ALERT_ANALYTICS_UPDATED", {
    detail: {
      ts: Date.now(),
      ...stats
    }
  })
);

}

// 🔔 Global alert event listener (ONLY ONE PLACE)
window.addEventListener("ALERT_EVENT", (e) => {
  console.log("[ALERT LIST] event received", e.detail);
  addAlert(e.detail);
});

window.dispatchEvent(
  new CustomEvent("ALERT_STATE_UPDATED")
);
