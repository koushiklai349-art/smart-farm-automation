// dashboard/js/pages/logs.page.js

import { store } from "../store.js";
import {
  getDeviceConfidence,
  getDeviceConfidenceTrend
} from "../devices/device.manager.js";
import { isRecoveryInProgress } from "../recovery/recovery.state.js";
import { getAutoActionStatus } from "../auto-action/auto.action.status.js";
import { deviceStore } from "../store/device.store.js";

function getQueryParam(name) {
  const hash = window.location.hash || "";
  const qIndex = hash.indexOf("?");
  if (qIndex === -1) return null;
  const params = new URLSearchParams(hash.slice(qIndex + 1));
  return params.get(name);
}

function getSeverity(log) {
  return (
    log.severity ||
    log.level ||
    (log.type === "ALERT" ? "warning" : "info")
  ).toLowerCase();
}

// in-memory severity filter (UI only)
const severityFilter = {
  info: true,
  warning: true,
  error: true,
  critical: true
};

function getRecoveryState(deviceId) {
  if (!deviceId) return "NONE";
  return isRecoveryInProgress(deviceId) ? "IN_PROGRESS" : "COMPLETED";
}

function getAutoEnabled(deviceId) {
  if (!deviceId) return "";
  const s = getAutoActionStatus(deviceId);
  return typeof s?.enabled === "boolean" ? s.enabled : "";
}

function getAutoDecision(log) {
  if (log.guardResult?.allowed === true) {
    return { outcome: "ALLOWED", reason: "GUARD_OK" };
  }
  if (log.guardResult?.allowed === false) {
    return {
      outcome: "BLOCKED",
      reason:
        log.guardResult.reason ||
        log.guardReason ||
        log.policyReason ||
        ""
    };
  }
  if (log.status === "BLOCKED" || log.stage === "BLOCKED") {
    return { outcome: "BLOCKED", reason: log.reason || "" };
  }
  return { outcome: "", reason: "" };
}

function getActionMode(log) {
  if (log.isPredictive === true || log.context?.isPredictive === true) {
    return "PREDICTIVE";
  }
  if (log.type === "ALERT" || log.source === "AUTO_ACTION_ENGINE") {
    return "REACTIVE";
  }
  return "";
}

// 🧠 System confidence snapshot
function getSystemConfidenceSnapshot() {
  const devices = deviceStore.getAll?.() || [];
  if (!devices.length) return { score: "", level: "" };

  let total = 0;
  let count = 0;
  devices.forEach(d => {
    const conf = getDeviceConfidence(d.deviceId);
    if (conf && typeof conf.score === "number") {
      total += conf.score;
      count += 1;
    }
  });

  if (!count) return { score: "", level: "" };

  const avg = Math.round(total / count);
  let level = "HIGH";
  if (avg < 40) level = "LOW";
  else if (avg < 70) level = "MEDIUM";

  return { score: avg, level };
}

export function LogsPage() {
  const deviceId = getQueryParam("deviceId");

  let logs = deviceId
    ? store.logs.filter(l => l.deviceId === deviceId)
    : store.logs;

  logs = logs.filter(log => {
    const sev = getSeverity(log);
    return severityFilter[sev] !== false;
  });

  const systemConfidence = getSystemConfidenceSnapshot();

  // expose for export (Phase-11.9: policyId + ruleId added)
  window.__VISIBLE_LOGS__ = {
    deviceId: deviceId || "all",
    rows: logs.map(l => {
      const conf = l.deviceId ? getDeviceConfidence(l.deviceId) : null;
      const trend = l.deviceId ? getDeviceConfidenceTrend(l.deviceId) : "";
      const decision = getAutoDecision(l);

      return {
        time: l.time || l.at || "",
        severity: getSeverity(l),
        source: l.source || "",
        deviceId: l.deviceId || "",
        message: l.message || "",
        decisionStage: l.stage || l.status || l.type || "",
        decisionReason:
          l.reason || l.policyReason || l.guardReason || "",
        confidenceScore: conf?.score ?? "",
        confidenceLevel: conf?.level ?? "",
        confidenceTrend: trend || "",
        recoveryState: getRecoveryState(l.deviceId),
        autoActionEnabled: getAutoEnabled(l.deviceId),
        autoDecisionOutcome: decision.outcome,
        autoDecisionReason: decision.reason,
        actionMode: getActionMode(l),
        systemConfidenceScore: systemConfidence.score,
        systemConfidenceLevel: systemConfidence.level,
        // ⭐ NEW
        policyId:
          l.policyId ||
          l.meta?.policyId ||
          "",
        ruleId:
          l.ruleId ||
          l.meta?.ruleId ||
          ""
      };
    })
  };

  return `
    <h1>📜 System Logs</h1>
    <h2>🧠 Decision / Recovery Timeline</h2>
  <div id="recovery-timeline"></div>
    ${
      deviceId
        ? `<div class="log-filter">
             Showing logs for device: <b>${deviceId}</b>
             · <a href="#/logs" class="clear-filter">Clear filter</a>
           </div>`
        : ""
    }

    <div class="log-toolbar">
      <div class="severity-filter">
        ${renderSeverityToggle("info", "INFO")}
        ${renderSeverityToggle("warning", "WARNING")}
        ${renderSeverityToggle("error", "ERROR")}
        ${renderSeverityToggle("critical", "CRITICAL")}
      </div>

      <button class="export-btn" onclick="window.exportLogsCSV()">
        ⬇ Export CSV
      </button>
    </div>

    <ul class="log-list">
      ${
        logs.length
          ? logs.map(log => {
              const sev = getSeverity(log);
              return `
                <li class="log-item ${sev}">
                  <span class="log-time">${log.time}</span>
                  <strong>${log.source || "-"}</strong>
                  ${log.deviceId ? `(<em>${log.deviceId}</em>) —` : "—"}
                  ${log.message || ""}
                </li>
              `;
            }).join("")
          : `<li class="log-empty">No logs found</li>`
      }
    </ul>
  `;
}

function renderSeverityToggle(key, label) {
  const checked = severityFilter[key] ? "checked" : "";
  return `
    <label class="sev-toggle ${key}">
      <input
        type="checkbox"
        ${checked}
        onchange="window.toggleSeverity('${key}')"
      />
      ${label}
    </label>
  `;
}

// UI handlers
window.toggleSeverity = function (key) {
  severityFilter[key] = !severityFilter[key];
  window.location.hash = window.location.hash; // re-render
};

window.exportLogsCSV = function () {
  const payload = window.__VISIBLE_LOGS__;
  if (!payload || !payload.rows.length) {
    alert("No logs to export");
    return;
  }

  const { rows, deviceId } = payload;

  const header = Object.keys(rows[0]).join(",");
  const csv = [
    header,
    ...rows.map(r =>
      Object.values(r)
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().slice(0, 10);
  const fileName = `logs_${deviceId}_${date}.csv`;

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
};
