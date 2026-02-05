// dashboard/js/ui/dashboard/device.summary.js

import { getAutoActionStatus } from "../../auto-action/auto.action.status.js";
import { toggleAutoAction } from "../../auto-action/auto.action.toggle.js";
import {
  getDeviceConfidence,
  getDeviceConfidenceTrend
} from "../../devices/device.manager.js";
import { auditStore } from "../../audit/audit.store.js";

const deviceState = {};

export function updateDeviceSummary(alert) {
  const deviceId = alert.context?.deviceId || "system";
  if (!deviceId) return;

  if (!deviceState[deviceId]) {
    deviceState[deviceId] = {
      deviceId,
      status: "UNKNOWN",
      lastEvent: null,
      criticalCount: 0,
      warningCount: 0
    };
  }

  const d = deviceState[deviceId];
  d.lastEvent = alert.timestamp;

  if (alert.severity === "critical") {
    d.criticalCount += 1;
    d.status = "OFFLINE";
  } else if (alert.severity === "warning") {
    d.warningCount += 1;
    d.status = "WARNING";
  } else if (alert.code === "DEVICE_RECOVERED") {
    d.status = "ONLINE";
  }

  renderDeviceSummary();
}

function renderDeviceSummary() {
  const container = document.getElementById("device-summary");
  if (!container) return;

  container.innerHTML = Object.values(deviceState)
    .map(renderRow)
    .join("");
}

function renderRow(d) {
  const auto = getAutoActionStatus(d.deviceId);
  const confidence = getDeviceConfidence(d.deviceId);
  const trend = getDeviceConfidenceTrend(d.deviceId);

  const confLevel = confidence?.level || "UNKNOWN";
  const confScore = confidence?.score ?? "--";

  const trendIcon =
    trend === "UP" ? "↑" :
    trend === "DOWN" ? "↓" :
    "→";

  let autoBadge = "AUTO SAFE";
  let badgeClass = "safe";
  if (confLevel === "MEDIUM") {
    autoBadge = "AUTO CAUTION";
    badgeClass = "caution";
  } else if (confLevel === "LOW") {
    autoBadge = "AUTO RISKY";
    badgeClass = "risky";
  }

  const decisions = getLastDecisions(d.deviceId);

  return `
    <div class="device-row ${d.status.toLowerCase()} confidence-${confLevel.toLowerCase()}">
      <strong>${d.deviceId}</strong>

      <span class="status">${d.status}</span>

      <span class="auto-badge ${badgeClass}">
        ${autoBadge}
        <div class="decision-popup">
          <strong>Last decisions</strong>
          ${
            decisions.length
              ? decisions.map(e => renderDecisionItem(e, d.deviceId)).join("")
              : `<div class="decision-item empty">No recent activity</div>`
          }
        </div>
      </span>

      <span class="confidence ${confLevel.toLowerCase()}">
        🛡 ${confLevel} (${confScore}) <b>${trendIcon}</b>
      </span>

      <button
        class="auto-toggle ${auto.enabled ? "on" : "off"}"
        onclick="window.toggleAutoActionUI('${d.deviceId}')"
      >
        ${auto.label}
      </button>

      <span class="count">⚠ ${d.warningCount} | ❌ ${d.criticalCount}</span>

      <small>${timeAgo(d.lastEvent)}</small>
    </div>
  `;
}

function getLastDecisions(deviceId) {
  return auditStore
    .getAll()
    .filter(e => e.deviceId === deviceId)
    .slice(-3)
    .reverse();
}

function renderDecisionItem(e, deviceId) {
  const time = timeAgo(e.time || e.at);
  const label = e.stage || e.status || e.type;
  const reason = e.reason || e.policyReason || e.guardReason || "";

  return `
    <div
      class="decision-item clickable"
      onclick="window.openAuditForDevice('${deviceId}')"
      title="View full audit"
    >
      <span class="label">${label}</span>
      <small>${time}</small>
      ${reason ? `<em>${reason}</em>` : ""}
    </div>
  `;
}

function timeAgo(ts) {
  if (!ts) return "";
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

window.addEventListener("ALERT_EVENT", (e) => {
  updateDeviceSummary(e.detail);
});

window.toggleAutoActionUI = function (deviceId) {
  toggleAutoAction(deviceId);
  renderDeviceSummary();
};

// 🔗 Quick navigation to audit page
window.openAuditForDevice = function (deviceId) {
  // router compatible (hash based)
  window.location.hash = `#/logs?deviceId=${deviceId}`;
};
