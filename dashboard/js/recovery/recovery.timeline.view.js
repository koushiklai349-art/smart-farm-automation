// dashboard/js/recovery/recovery.timeline.view.js
import { getFilteredRecoveryTimeline } from "./recovery.timeline.store.js";
import { getRecoveryDurations } from "./recovery.timeline.store.js";
import { showOverrideImpact } from "../components/operator.override.impact.view.js";
import { correlateRecoveryIncidents } from "./recovery.timeline.correlation.js";
import { exportIncidentCSV,exportIncidentJSON } from "./recovery.incident.report.js";
import { buildIncidentSummary } from "./recovery.incident.summary.js";
import { computeIncidentScore } from "./recovery.incident.score.js";
import { buildIncidentRecommendations } from "./recovery.incident.recommendation.js";
import { resolvePlaybookActions } from "./recovery.playbook.engine.js";
import { onRecoveryStart } from "./recovery.engine.js";
import { quarantineDevice, releaseDevice } from "./device.quarantine.js";
import { auditStore } from "../audit/audit.store.js";
import { canExecutePlaybook } from "../system/rbac.guard.js";
import { getCurrentUserRole } from "../system/user.role.store.js";
import { getPlaybookTrustLevel } from "./playbook/recovery.playbook.trust.js";
import { getRecentPlaybookOutcomes } from "./playbook/recovery.playbook.outcome.store.js";
import { isActionCurrentlySuppressed,getSuppressionExplain } from "./playbook/recovery.playbook.outcome.store.js";
import { renderSuppressionHistory } from "./playbook/recovery.playbook.suppression.view.js";
import { getActionWeightHistory } from "./playbook/recovery.playbook.weight.store.js";


/* ---------------- TIME RANGE ---------------- */

const TIME_RANGES = {
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000
};

function sinceFromRange(key) {
  if (!TIME_RANGES[key]) return null;
  return Date.now() - TIME_RANGES[key];
}

/* ---------------- UI MAP ---------------- */

const TYPE_UI = {
  FAILURE: { icon: "⛔", color: "#e53935", label: "Failure" },
  RETRY: { icon: "🔁", color: "#1e88e5", label: "Retry" },
  QUARANTINED: { icon: "🧊", color: "#fb8c00", label: "Quarantined" },
  MANUAL_RELEASE: { icon: "🧑‍🔧", color: "#8e24aa", label: "Manual Release" },
  RECOVERED: { icon: "✅", color: "#43a047", label: "Recovered" },
  SYSTEM_MODE: { icon: "🧠", color: "#6d4c41", label: "System Mode" },
  SLA_BREACH: { icon: "⏱️", color: "#f9a825", label: "SLA Breach" },
  OPERATOR_OVERRIDE: { icon: "🧑‍💼", color: "#3949ab", label: "Operator Override" },
  PLAYBOOK_OUTCOME: { icon: "🧪",color: "#6a1b9a",label: "Playbook Outcome"}

};
const history = getActionWeightHistory("RETRY_DEVICE");
console.log(history);

/* ---------------- UTILS ---------------- */

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

function formatDuration(ms) {
  if (!ms || ms < 0) return "";
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  return min > 0 ? `${min}m ${sec % 60}s` : `${sec}s`;
}

function getDeviceIdFromURL() {
  const hash = window.location.hash || "";
  const qIndex = hash.indexOf("?");
  if (qIndex === -1) return null;
  const params = new URLSearchParams(hash.slice(qIndex + 1));
  return params.get("deviceId");
}

/* ---------------- FILTER UI ---------------- */

function buildTimelineFilters(onChange) {
  const wrap = document.createElement("div");
  wrap.className = "timeline-filters";

  const typeBox = document.createElement("div");
  typeBox.className = "filter-types";

  [
    "FAILURE",
    "QUARANTINED",
    "RECOVERED",
    "SLA_BREACH",
    "OPERATOR_OVERRIDE"
  ].forEach(type => {
    const label = document.createElement("label");
    label.style.marginRight = "8px";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = type;
    cb.checked = true;
    cb.onchange = onChange;

    label.appendChild(cb);
    label.append(` ${type}`);
    typeBox.appendChild(label);
  });

  const timeSelect = document.createElement("select");
  timeSelect.className = "filter-time";

  [
    ["1h", "Last 1 hour"],
    ["6h", "Last 6 hours"],
    ["24h", "Last 24 hours"],
    ["7d", "Last 7 days"]
  ].forEach(([val, text]) => {
    const opt = document.createElement("option");
    opt.value = val;
    opt.textContent = text;
    if (val === "24h") opt.selected = true;
    timeSelect.appendChild(opt);
  });

  timeSelect.onchange = onChange;

  wrap.appendChild(typeBox);
  wrap.appendChild(timeSelect);

  return { wrap, typeBox, timeSelect };
}

function executePlaybookAction(action, incident) {
  const deviceId = incident.deviceId;
  if (!deviceId) return;

  switch (action) {
    case "RETRY_DEVICE":
      onRecoveryStart(deviceId);
      auditStore.log({
        type: "PLAYBOOK_ACTION",
        action: "RETRY_DEVICE",
        deviceId,
        reason: "Playbook suggested retry"
      });
      break;

    case "QUARANTINE_DEVICE":
      quarantineDevice(deviceId);
      auditStore.log({
        type: "PLAYBOOK_ACTION",
        action: "QUARANTINE_DEVICE",
        deviceId,
        reason: "Playbook suggested quarantine"
      });
      break;

    case "RELEASE_DEVICE":
      releaseDevice(deviceId);
      auditStore.log({
        type: "PLAYBOOK_ACTION",
        action: "RELEASE_DEVICE",
        deviceId,
        reason: "Playbook suggested release"
      });
      break;

    case "NOTIFY_OPERATOR":
      auditStore.log({
        type: "PLAYBOOK_ACTION",
        action: "NOTIFY_OPERATOR",
        deviceId,
        reason: "Playbook notify operator"
      });
      alert(`Operator notified for ${deviceId}`);
      break;

    case "ESCALATE_INCIDENT":
      auditStore.log({
        type: "PLAYBOOK_ACTION",
        action: "ESCALATE_INCIDENT",
        deviceId,
        reason: "Playbook escalation"
      });
      alert(`Incident escalated for ${deviceId}`);
      break;

    default:
      console.warn("[Playbook] Unknown action:", action);
  }
}


/* ---------------- MAIN RENDER ---------------- */

export function renderRecoveryTimeline(container) {
  if (!container) return;

  const deviceId = getDeviceIdFromURL();
  const durations = getRecoveryDurations();

  container.innerHTML = "";

  const rerender = () => {
    const checkedTypes = Array.from(
      filters.typeBox.querySelectorAll("input:checked")
    ).map(i => i.value);

    const sinceMs = sinceFromRange(filters.timeSelect.value);

    const timeline = getFilteredRecoveryTimeline({
      deviceId,
      types: checkedTypes,
      sinceMs
    });

    drawTimeline(container, timeline, durations);
  };

  const filters = buildTimelineFilters(rerender);
  container.appendChild(filters.wrap);

  rerender();
}

/* ---------------- DRAW TIMELINE ---------------- */

function drawTimeline(container, timeline, durations) {
  container.querySelectorAll(".export-btn, .recovery-timeline, .empty-state")
    .forEach(e => e.remove());

  if (!timeline || timeline.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "🕒 No recovery events for selected filters";
    container.appendChild(empty);
    return;
  }

  const exportCSV = document.createElement("button");
  exportCSV.className = "export-btn";
  exportCSV.textContent = "⬇ Export Recovery CSV";
  exportCSV.onclick = () => exportTimelineCSV(timeline);

  const exportJSON = document.createElement("button");
  exportJSON.className = "export-btn";
  exportJSON.style.marginLeft = "8px";
  exportJSON.textContent = "⬇ Export Recovery JSON";
  exportJSON.onclick = () => exportTimelineJSON(timeline);

  container.appendChild(exportCSV);
  container.appendChild(exportJSON);

  const list = document.createElement("div");
  list.className = "recovery-timeline";

  // 🧭 Playbook Trust Legend
  
if (!container.querySelector(".playbook-legend")) {
  const legend = document.createElement("div");
  legend.className = "playbook-legend";
  legend.innerHTML = `
    <span class="legend trusted">🟢 Trusted (≥75%)</span>
    <span class="legend neutral">🟡 Neutral (40–74%)</span>
    <span class="legend risky">🔴 Risky (&lt;40%)</span>
  `;
  container.appendChild(legend);
}



  const incidents = correlateRecoveryIncidents(timeline);

incidents.forEach(incident => {
  const header = document.createElement("div");
  header.className = "incident-header";

  const duration =
    incident.durationMs != null
      ? `⏱ ${formatDuration(incident.durationMs)}`
      : "⏳ Ongoing";

const summary = buildIncidentSummary(incident);
const { severity, confidence } = computeIncidentScore(incident);

header.innerHTML = `
  <div class="incident-title">
    🧩 Device: <b>${incident.deviceId}</b>
  </div>

  <div class="incident-summary">
    ${summary}
  </div>

  <div class="incident-meta">
    <span class="incident-severity severity-${severity}">
      ${severity}
    </span>
    · <span class="incident-confidence">
      ${confidence}%
    </span>
    · ${duration}
    · 🔁 ${incident.retryCount} retries
    · <span class="incident-status">${incident.status}</span>
  </div>

  <div class="incident-actions">
    <button class="incident-export-btn">⬇ CSV</button>
    <button class="incident-export-btn">⬇ JSON</button>
    <button class="incident-export-btn explain-export-json">
    🧠 Explain JSON
    </button>
    <button class="incident-export-btn explain-export-csv">
    📄 Explain CSV
    </button>
  </div>
`;

 
const [csvBtn, jsonBtn] =
  header.querySelectorAll(".incident-export-btn");

csvBtn.onclick = (e) => {
  e.stopPropagation(); // prevent expand/collapse
  exportIncidentCSV(incident);
};

jsonBtn.onclick = (e) => {
  e.stopPropagation();
  exportIncidentJSON(incident);
};
  // 🔥 এখানেই STEP-159.3 এর handler বসবে
  const explainJsonBtn =
    header.querySelector(".explain-export-json");
  const explainCsvBtn =
    header.querySelector(".explain-export-csv");

  explainJsonBtn.onclick = (e) => {
    e.stopPropagation();
    exportIncidentExplainJSON(incident);
  };

  explainCsvBtn.onclick = (e) => {
    e.stopPropagation();
    exportIncidentExplainCSV(incident);
  };

  const body = document.createElement("div");
  body.className = "incident-body";
  body.style.display = "none";

  // toggle expand / collapse
  header.onclick = (e) => {
  if (e.target.closest(".incident-actions")) return;
  body.style.display =
    body.style.display === "none" ? "block" : "none";
  };

  // render events inside incident
  incident.events.forEach(event => {
    const ui = { ...(TYPE_UI[event.type] || {}) };

    if (event.type === "SLA_BREACH" && event.meta?.level) {
      ui.color =
        event.meta.level === "critical"
          ? "#d32f2f"
          : event.meta.level === "warning"
          ? "#f9a825"
          : ui.color;
    }

    const item = document.createElement("div");
    item.className = "timeline-item";
    item.dataset.type = event.type;
    // 🧪 TASK-161: human readable playbook outcome
    if (event.type === "PLAYBOOK_OUTCOME") {
      const statusIcon =
      event.status === "SUCCESS"
      ? "✅"
      : event.status === "FAILED"
      ? "❌"
      : "⚪";

      event.message =
    `${statusIcon} ${event.action} → ${event.status}`;
}

    item.innerHTML = `
      <div class="timeline-icon" style="color:${ui.color || "#555"}">
        ${ui.icon || "•"}
      </div>
      <div class="timeline-content">
        <div class="timeline-title">${ui.label || event.type}</div>
        <div class="timeline-message">
          ${event.message || ""}
          ${event.count > 1 ? `<span class="timeline-count">×${event.count}</span>` : ""}
        </div>
        <div class="timeline-time">${formatTime(event.ts)}</div>
      </div>
    `;
     // 🧠 Explain overlay (STEP-159.4)
  if (event.meta?.explain || event.explain) {
    const explain = event.meta?.explain || event.explain;

    const explainBtn = document.createElement("button");
    explainBtn.className = "timeline-explain-btn";
    explainBtn.textContent = "🧠 Why?";

    const explainBox = document.createElement("div");
    explainBox.className = "timeline-explain-box";
    explainBox.style.display = "none";

    explainBox.innerHTML = `
      <div><b>Decision:</b> ${explain.decision || "—"}</div>
      ${
      explain.reasons?.length
        ? `<div><b>Reasons:</b>
            <ul>
              ${explain.reasons.map(r => `<li>${r}</li>`).join("")}
            </ul>
           </div>`
        : ""
       }
      ${
       explain.confidence != null
        ? `<div><b>Confidence:</b> ${explain.confidence}%</div>`
         : ""
      }
     `;

  explainBtn.onclick = (e) => {
    e.stopPropagation();
    explainBox.style.display =
      explainBox.style.display === "none" ? "block" : "none";
  };

  item.querySelector(".timeline-content").appendChild(explainBtn);
  item.querySelector(".timeline-content").appendChild(explainBox);
}


    if (
      event.type === "OPERATOR_OVERRIDE" &&
      event.meta?.action === "ENABLE"
    ) {
      const btn = document.createElement("button");
      btn.className = "impact-btn";
      btn.textContent = "View Impact";
      btn.onclick = () => showOverrideImpact(event);
      item.querySelector(".timeline-content").appendChild(btn);
    }

    body.appendChild(item);
  });

  // 🛠 Suggested Playbook Actions
const actions = Array.isArray(resolvePlaybookActions(incident))
  ? resolvePlaybookActions(incident).sort(
      (a, b) => (b.weight ?? 0) - (a.weight ?? 0)
    )
  : [];


if (actions.length > 0) {
  const actionWrap = document.createElement("div");
  actionWrap.className = "incident-actions-panel";

  actionWrap.innerHTML = `
    <div class="actions-title">🛠 Suggested Actions</div>
    <div class="actions-buttons"></div>
  `;

  const btnBox = actionWrap.querySelector(".actions-buttons");

  actions.forEach(a => {
  const trust = getPlaybookTrustLevel(a.weight);
  const btn = document.createElement("button");

  const suppressed = isActionCurrentlySuppressed(a.action)
   ? getSuppressionExplain(a.action)
  : null;

  // 🧠 Explain panel (collapsible)
  if (a.explain) {
  const explainBox = document.createElement("div");
  explainBox.className = "action-explain";

  explainBox.innerHTML = `
    <div class="action-explain">
  <div class="explain-rule">Rule: <b>PB-RULE-3</b></div>
  <div class="explain-title">🧠 Why this action?</div>
    <ul>
    <li><b>Rule:</b> ${a.explain.ruleId}</li>
    <li><b>Risk:</b> ${a.explain.risk}</li>
    <li><b>Status:</b> ${a.explain.snapshot.status}</li>
    <li><b>Retries:</b> ${a.explain.snapshot.retryCount}</li>
    ${
      a.explain.snapshot.durationMs != null
        ? `<li><b>Duration:</b> ${Math.round(
            a.explain.snapshot.durationMs / 1000
          )}s</li>`
        : ""
    }
    </ul>
  `;

  // toggle on right-click (safe UX)
// 🧠 Explain toggle button
const explainToggle = document.createElement("button");
explainToggle.className = "explain-toggle-btn";
explainToggle.textContent = "🧠 Why?";

explainToggle.onclick = (e) => {
  e.stopPropagation();
  explainBox.classList.toggle("open");
};

// default collapsed
explainBox.classList.remove("open");

btnBox.appendChild(explainToggle);
btnBox.appendChild(explainBox);

}

  btn.className =
  `action-btn ${trust.level} risk-${a.risk}` +
  (suppressed ? " suppressed" : "");


  btn.innerHTML = `
 ${trust.icon} ${formatActionLabel(a.action)}

${
  suppressed
    ? `<span class="suppressed-badge">SUPPRESSED</span>`
    : `<span class="risk-badge risk-${a.risk}">
         ${a.risk.toUpperCase()}
       </span>`
}


 <small>${trust.label} · ${a.weight}%</small>
`;


// 🚫 STEP-164.3: disable suppressed action
if (suppressed) {
  btn.disabled = true;

  btn.title =
    `SUPPRESSED\n` +
    `Reason: ${suppressed.reason || "Low trust"}\n` +
    `Weight: ${suppressed.weight}\n` +
    `Since: ${new Date(
      suppressed.suppressedAt
    ).toLocaleString()}`;

  btnBox.appendChild(btn);
  btnBox.appendChild(trend);
  return; // ⛔ execute logic skip
}

const trend = document.createElement("div");
trend.className = "action-trend";
trend.textContent = `Recent: ${renderOutcomeDots(a.action)}`;

  btn.onclick = () => {
    const role =
      typeof getCurrentUserRole === "function"
        ? getCurrentUserRole()
        : "operator"; // fallback

    const check = canExecutePlaybook(a.action, a.risk, role);

    if (!check.allowed) {
      auditStore.log({
        type: "PLAYBOOK_BLOCKED",
        action: a.action,
        deviceId: incident.deviceId,
        reason: check.reason
      });

      alert(`❌ Action blocked: ${check.reason}`);
      return;
    }

    let msg = `Execute "${a.action}" for ${incident.deviceId}?`;

    if (a.risk === "medium") {
      msg =
        `⚠️ Medium Risk Action\n\n` +
        `Action: ${a.action}\nDevice: ${incident.deviceId}\n\nProceed?`;
    }

    if (a.risk === "high") {
      msg =
        `🚨 HIGH RISK ACTION 🚨\n\n` +
        `Action: ${a.action}\nDevice: ${incident.deviceId}\n\n` +
        `This may impact system stability.\n\nProceed anyway?`;
    }

    if (confirm(msg)) {
      executePlaybookAction(a.action, incident);
    }
  };

  btnBox.appendChild(btn);
  btnBox.appendChild(trend);
});


  body.appendChild(actionWrap);
}
// 🛑 Suppression History Panel (TASK-167)
const suppressionBox = document.createElement("div");
suppressionBox.className = "suppression-panel";

renderSuppressionHistory(suppressionBox);

body.appendChild(suppressionBox);

  // 💡 Recommendations (after events)
const recs = buildIncidentRecommendations(incident);

if (recs && recs.length > 0) {
  const recWrap = document.createElement("div");
  recWrap.className = "incident-recommendations";

  recWrap.innerHTML = `
    <div class="rec-title">💡 Recommendations</div>
    <ul class="rec-list">
      ${recs.map(r => `<li>${r}</li>`).join("")}
    </ul>
  `;

  body.appendChild(recWrap);
}


  list.appendChild(header);
  list.appendChild(body);
});
}

/* ---------------- EXPORT ---------------- */

function exportTimelineCSV(timeline) {
  const rows = timeline.map(e => ({
    time: new Date(e.ts).toISOString(),
    type: e.type,
    deviceId: e.refId || "",
    message: e.message || ""
  }));

  const csv = [
    "time,type,deviceId,message",
    ...rows.map(r =>
      Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
    )
  ].join("\n");

  downloadBlob(csv, "text/csv", "recovery_timeline.csv");
}

function exportTimelineJSON(timeline) {
  downloadBlob(
    JSON.stringify({ exportedAt: new Date().toISOString(), events: timeline }, null, 2),
    "application/json",
    "recovery_timeline.json"
  );
}

function downloadBlob(data, type, name) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatActionLabel(action) {
  switch (action) {
    case "RETRY_DEVICE":
      return "🔁 Retry Device";
    case "QUARANTINE_DEVICE":
      return "🧊 Quarantine Device";
    case "RELEASE_DEVICE":
      return "🔓 Release Device";
    case "NOTIFY_OPERATOR":
      return "🚨 Notify Operator";
    case "ESCALATE_INCIDENT":
      return "⬆️ Escalate Incident";
    default:
      return action;
  }
}

function renderOutcomeDots(action) {
 if (typeof getRecentPlaybookOutcomes !== "function") {
  return "—";
}

  const outcomes = getRecentPlaybookOutcomes(action, 5) || [];

  return outcomes.map(o => {
    if (o.status === "SUCCESS") return "✅";
    if (o.status === "FAILED") return "❌";
    if (o.status === "NO_EFFECT") return "⚪";
    return "❔";
  }).join(" ");
}
function exportIncidentExplainJSON(incident) {
  const actions = resolvePlaybookActions(incident);

  const payload = {
    incidentId: incident.id || null,
    deviceId: incident.deviceId,
    exportedAt: new Date().toISOString(),
    actions: actions.map(a => ({
      action: a.action,
      ruleId: a.explain?.ruleId,
      risk: a.risk,
      weight: a.weight,
      trustLevel: getPlaybookTrustLevel(a.weight).label,
      snapshot: a.explain?.snapshot || null
    }))
  };

  downloadBlob(
    JSON.stringify(payload, null, 2),
    "application/json",
    `incident_${incident.deviceId}_explain.json`
  );
}

function exportIncidentExplainCSV(incident) {
  const actions = resolvePlaybookActions(incident);

  const rows = actions.map(a => ({
    action: a.action,
    ruleId: a.explain?.ruleId || "",
    risk: a.risk,
    weight: a.weight,
    trust: getPlaybookTrustLevel(a.weight).label,
    retries: a.explain?.snapshot?.retryCount ?? "",
    status: a.explain?.snapshot?.status ?? "",
    durationMs: a.explain?.snapshot?.durationMs ?? ""
  }));

  const csv = [
    "action,ruleId,risk,weight,trust,retries,status,durationMs",
    ...rows.map(r =>
      Object.values(r)
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
  ].join("\n");

  downloadBlob(
    csv,
    "text/csv",
    `incident_${incident.deviceId}_explain.csv`
  );
}
