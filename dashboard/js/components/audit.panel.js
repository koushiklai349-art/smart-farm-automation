// dashboard/js/components/audit.panel.js
import { auditStore } from "../audit/audit.store.js";
import { metricsStore } from "../audit/metrics.store.js";
import { getRecoveryTimeline, getRecoveryDurations } from "../recovery/recovery.timeline.store.js";
import { renderRecoveryTimeline } from "../recovery/recovery.timeline.view.js";

export function AuditPanel() {
  
  const metrics = metricsStore.get();
  const allLogs = auditStore.getAll().slice(-200).reverse();
// last 50 only
  // 🔁 TASK-85: auto-refresh recovery timeline on audit update
  setTimeout(() => {
  const container = document.getElementById("recovery-timeline");
  if (container) {
    renderRecoveryTimeline(container);
  }
}, 0);

  const deviceId = getDeviceIdFromURL();
 
let deviceSummary = null;

if (deviceId) {
  const timeline = getRecoveryTimeline(deviceId);
  const durations = getRecoveryDurations().filter(
    d => d.deviceId === deviceId
  );

  const failures = timeline.filter(e => e.type === "FAILURE").length;
  const recoveries = timeline.filter(e => e.type === "RECOVERED").length;

  let avgMs = 0;
  let lastMs = 0;

  if (durations.length > 0) {
    avgMs =
      durations.reduce((a, b) => a + b.durationMs, 0) /
      durations.length;

    lastMs = durations[durations.length - 1].durationMs;
  }

  deviceSummary = {
    failures,
    recoveries,
    avgMs,
    lastMs
  };
}


  return `
    <section class="audit-panel">

      <h2>📊 System Metrics</h2>
      <div class="metrics">
        <div>📤 Sent: <b>${metrics.sent}</b></div>
        <div>✅ Success: <b>${metrics.success}</b></div>
        <div>❌ Failed: <b>${metrics.failed}</b></div>
        <div>⏱ Timeout: <b>${metrics.timeout}</b></div>
      </div>
      ${
  deviceSummary
    ? `
    <div class="stat-card" style="margin-top:12px;">
      <h4>📟 Device Recovery — ${deviceId}</h4>
      <ul style="list-style:none;padding:0;margin:0;font-size:13px;">
        <li>⛔ Failures: <b>${deviceSummary.failures}</b></li>
        <li>✅ Recoveries: <b>${deviceSummary.recoveries}</b></li>
        <li>⏱ Avg Recovery: <b>${Math.round(deviceSummary.avgMs / 1000)}s</b></li>
        <li>🕒 Last Recovery: <b>${Math.round(deviceSummary.lastMs / 1000)}s</b></li>
      </ul>
    </div>
  `
    : ""
}

      <h2>🧠 Decision Timeline</h2>
      <div id="recovery-timeline"></div>

      ${
        allLogs.length === 0
          ? `<div class="audit-empty">No audit records yet</div>`
          : `
        <table width="100%" class="audit-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Device</th>
              <th>Action</th>
              <th>Status / Stage</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody id="audit-table-body">
            ${allLogs.map(renderAuditRow).join("")}
          </tbody>
        </table>
      `}
    </section>
  `;
  
}

function getDeviceIdFromURL() {
  const hash = window.location.hash || "";
  const qIndex = hash.indexOf("?");
  if (qIndex === -1) return null;
  const params = new URLSearchParams(hash.slice(qIndex + 1));
  return params.get("deviceId");
}

function renderAuditRow(log) {
  const time = new Date(log.time || log.at).toLocaleTimeString();
  const type = log.type || "COMMAND";
  const status = log.stage || log.status || "-";
  const reason =
    log.reason ||
    log.policyReason ||
    log.guardReason ||
    log.message ||
    "";

  return `
    <tr class="audit-row audit-${type.toLowerCase()}">
      <td>${time}</td>
      <td>${type}</td>
      <td>${log.deviceId || "-"}</td>
      <td>${log.action || "-"}</td>
      <td><b>${status}</b></td>
      <td>${reason}</td>
    </tr>
  `;
}

function getUniqueDevices(logs) {
  return Array.from(
    new Set(logs.map(l => l.deviceId).filter(Boolean))
  );
}

function applyAuditFilters(logs, filters) {
  const { type, deviceId, sinceMs } = filters;

  return logs.filter(log => {
    if (type && log.type !== type) return false;
    if (deviceId && log.deviceId !== deviceId) return false;

    if (sinceMs) {
      const t = new Date(log.at || log.time).getTime();
      if (t < sinceMs) return false;
    }

    return true;
  });
}

function buildAuditFilters(logs, onChange) {
  const devices = getUniqueDevices(logs);

  return `
    <div class="audit-filters">
      <label>
        Type:
        <select id="audit-filter-type">
          <option value="">All</option>
          <option value="COMMAND">COMMAND</option>
          <option value="ALERT">ALERT</option>
          <option value="FAILURE">FAILURE</option>
          <option value="RECOVERY">RECOVERY</option>
          <option value="SYSTEM">SYSTEM</option>
        </select>
      </label>

      <label>
        Device:
        <select id="audit-filter-device">
          <option value="">All</option>
          ${devices.map(d => `<option value="${d}">${d}</option>`).join("")}
        </select>
      </label>

      <label>
        Time:
        <select id="audit-filter-time">
          <option value="">All</option>
          <option value="3600000">Last 1h</option>
          <option value="21600000">Last 6h</option>
          <option value="86400000">Last 24h</option>
        </select>
      </label>
    </div>
  `;
}

setTimeout(() => {
  const typeSel = document.getElementById("audit-filter-type");
  const devSel = document.getElementById("audit-filter-device");
  const timeSel = document.getElementById("audit-filter-time");
  const body = document.getElementById("audit-table-body");

  if (!typeSel || !body) return;

  function rerender() {
    const filters = {
      type: typeSel.value || null,
      deviceId: devSel.value || null,
      sinceMs: timeSel.value ? Date.now() - Number(timeSel.value) : null
    };

    const logs = applyAuditFilters(
      auditStore.getAll().slice(-200).reverse(),
      filters
    );

    body.innerHTML = logs.map(renderAuditRow).join("");
  }

  typeSel.onchange = rerender;
  devSel.onchange = rerender;
  timeSel.onchange = rerender;
}, 0);
