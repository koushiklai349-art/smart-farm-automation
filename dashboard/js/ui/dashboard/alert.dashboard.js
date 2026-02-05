// /ui/dashboard/alert.dashboard.js
import { getAlerts } from "./alert.list.js";

const FILTER_STORAGE_KEY = "alert.filter.state";


const alertFilter = {
  severity: "ALL",
  deviceId: ""
};

function loadFilterState() {
  try {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY);
    if (!saved) return;

    const parsed = JSON.parse(saved);
    if (parsed.severity) alertFilter.severity = parsed.severity;
    if (parsed.deviceId !== undefined) alertFilter.deviceId = parsed.deviceId;
  } catch (e) {
    console.warn("Failed to load alert filter state");
  }
}

function saveFilterState() {
  localStorage.setItem(
    FILTER_STORAGE_KEY,
    JSON.stringify(alertFilter)
  );
}

// called from backend notifyUI hook

function renderAlertDashboard() {
  const container = document.getElementById("alert-dashboard");
  if (!container) return;

  const filtered = getAlerts().filter((alert) => {
    // severity filter
    if (
      alertFilter.severity !== "ALL" &&
      alert.severity !== alertFilter.severity
    ) {
      return false;
    }

    // device filter
    if (
      alertFilter.deviceId &&
      alert.context?.deviceId !== alertFilter.deviceId
    ) {
      return false;
    }

    return true;
  });

  if (filtered.length === 0) {
  container.innerHTML = `
    <div class="no-alerts">
      No alerts matching filter
    </div>
  `;
  return;
}

container.innerHTML = filtered.map(renderAlertRow).join("");

}


function renderAlertRow(alert) {
  return `
    <div class="alert-row ${alert.severity}">
      <strong>${alert.code}</strong>
      <span>${alert.message}</span>
      <small>${new Date(alert.timestamp).toLocaleTimeString()}</small>
    </div>
  `;
}


const severitySelect = document.getElementById("severity-filter");
const deviceInput = document.getElementById("device-filter");

if (severitySelect) {
  severitySelect.addEventListener("change", (e) => {
  alertFilter.severity = e.target.value;
  saveFilterState();
  renderAlertDashboard();
});

}

if (deviceInput) {
  deviceInput.addEventListener("input", (e) => {
  alertFilter.deviceId = e.target.value.trim();
  saveFilterState();
  renderAlertDashboard();
});

}
loadFilterState();
if (severitySelect) {
  severitySelect.value = alertFilter.severity;
}

if (deviceInput) {
  deviceInput.value = alertFilter.deviceId;
}

// 🟢 render existing alerts once UI is ready
window.addEventListener("DOMContentLoaded", () => {
  renderAlertDashboard();
});

window.addEventListener("ALERT_STATE_UPDATED", () => {
  renderAlertDashboard();
});
