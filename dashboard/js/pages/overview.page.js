const DEV_MODE = true; // 🔒 set false in production
import { getAuditHistory } from "../audit/audit.history.js";
import { store } from "../store.js";
import { StatCard } from "../components/stat.card.js";
import { AnimalCard } from "../components/animal.card.js";
import { loadPage } from "../router.js";
import { getAlertCounts } from "../components/alert.counter.js";
import { RecoveryStatsCard } from "../components/recovery.stats.card.js";
import {quarantineDevice,releaseDevice} from "../recovery/device.quarantine.js";
import {onRecoveryStart,onDeviceOnline} from "../recovery/recovery.engine.js";
import { auditStore } from "../audit/audit.store.js";
import { RecoverySLACard } from "../components/recovery.sla.card.js";
import { renderRestartHistory } from "../ui/dashboard/engine.restart.history.view.js";
import { renderAlertTrendGraph } from "../ui/dashboard/alert.trend.graph.js";
import { exportAlertsAsCSV,exportAlertsAsJSON } from "../utils/alert.export.js";
import { canExportAlerts } from "../system/rbac.guard.js";
import { renderSystemStatusInline } from "../components/system.status.inline.js";
import { SystemStatus } from "../components/system.status.js";
import { renderRecoveryMiniInsight }from "../recovery/recovery.incident.summary.js";
import { PlaybookEffectivenessCard } from "../components/playbook.effectiveness.card.js";
import { deviceStore } from "../devices/device.store.js";
import { renderIncidentPanel } from "../incident/incident.view.js";
import { renderStabilityPanel } from "../stability/stability.view.js";
import { PredictionRiskCard } from "../components/prediction.risk.card.js";
import { getSensorSnapshot } from "../store/sensor.store.js";
import { ExplainPanel } from "../components/explain.panel.js";

export function OverviewPage() {
  const alertCount = getAlertCounts(store.alerts);
  const sensors = getSensorSnapshot();

  const temp = sensors.temperature ?? "…";
  const hum  = sensors.humidity ?? "…";
  const soil = sensors.soil_moisture ?? "…";

  return `
    <h1>Farm Overview</h1>

    <!-- A. System Snapshot -->
    <section class="overview-section">
      ${renderSystemStatusInline()}
    </section>
     <!-- A2. Detailed System Status -->
     <section class="overview-section">
       ${SystemStatus()}
     </section>

     <!-- 🧠 Connected Devices -->
    <section class="overview-section">
     <h2>🖥 Connected Devices</h2>

    <div class="card">
    <ul id="device-list" style="list-style:none;padding:0;margin:0;"></ul>
    </div>
   </section>
        <!-- 🌡 Live Sensor Telemetry -->
    <section class="overview-section">
      <h2>🌡 Live Sensors</h2>

      <div class="dashboard-grid">
        ${(() => {
          const sensors = getSensorSnapshot();

          return `
            ${StatCard({
              label: "🌡 Temperature (°C)",
              value: sensors.temperature ?? "--",
              status: "ok"
            })}

            ${StatCard({
              label: "💧 Humidity (%)",
              value: sensors.humidity ?? "--",
              status: "ok"
            })}

            ${StatCard({
              label: "🌱 Soil Moisture (%)",
              value: sensors.soil_moisture ?? "--",
              status: "ok"
            })}
          `;
        })()}
      </div>
    </section>

    <!-- B. Key Metrics -->
    <section class="overview-section">
      <h2>📊 Key Metrics</h2>
       
      <div class="dashboard-grid">
        ${StatCard({
          label: "🐄 Total Cows",
          value: store.animals.cow,
          status: "ok"
        })}

        ${StatCard({
          label: "🐔 Poultry",
          value: store.animals.poultry,
          status: "ok"
        })}

        ${StatCard({
          label: "🌱 Feed",
          value: store.feedStatus.toUpperCase(),
          status: store.feedStatus
        })}

        ${StatCard({
          label: "⚡ Power",
          value: store.power.toUpperCase(),
          status:
            store.system.health === "critical" || store.power === "off"
              ? "bad"
              : "ok"
        })}

        ${StatCard({
          label: "🚨 Alerts",
          value: `${alertCount.critical} Critical / ${alertCount.warning} Warning`,
          status: store.system.health === "critical" ? "bad" : "ok"
        })}
      </div>

      ${canExportAlerts() ? `
        <div style="margin-top:12px;">
          <button onclick="window.exportAlertsCSV()">📥 Export CSV</button>
          <button onclick="window.exportAlertsJSON()">📥 Export JSON</button>
        </div>
      ` : ""}
    </section>

    <!-- C. Trends & Stability -->
    <section class="overview-section">
      <h2>📈 Trends & Stability</h2>

      <div class="card">
        <canvas id="alert-trend-canvas" height="120"></canvas>
      </div>
    </section>

    <!-- 🧠 Incidents & Stability (Phase-2.7) -->
    <section class="overview-section">
      <h2>🚨 Incidents</h2>
      <div id="incident-panel"></div>
    </section>

    <section class="overview-section">
      <h2>📊 Device Stability</h2>
      <div id="stability-panel"></div>
    </section>
   
    <!-- 🔮 Prediction & Early Warning -->
   <section class="overview-section">
     <h2>🔮 Prediction & Early Warning</h2>
     ${PredictionRiskCard()}
   </section>

    <!-- D. Recovery & Reliability -->
    <section class="overview-section">
      <h2>🛠 Recovery & Reliability</h2>

      ${RecoveryStatsCard()}
      ${RecoverySLACard()}
      ${PlaybookEffectivenessCard()}

     <div id="recovery-insight-mini"></div>

      <div class="card" style="margin-top:16px;">
        <h3>🔄 Engine Restart History</h3>
        <div id="engine-restart-history"></div>
      </div>
    </section>
    
    <!-- 🤖 Automation Explain -->
    <section class="overview-section">
      ${ExplainPanel()}
    </section>

    <!-- E. Animal Breakdown -->
    <section class="overview-section animal-row">
      <h2>🐾 Animal Breakdown</h2>

      <div class="animal-grid">
        ${AnimalCard({
          label: "🐄 Cow",
          value: store.animals.cow,
          page: "cow"
        })}

        ${AnimalCard({
          label: "🐐 Goat",
          value: store.animals.goat,
          page: "goat"
        })}

        ${AnimalCard({
          label: "🐔 Poultry",
          value: store.animals.poultry,
          page: "poultry"
        })}

        ${AnimalCard({
          label: "🐟 Fish",
          value: store.animals.fish,
          page: "fish"
        })}
      </div>
    </section>

    <!-- F. Developer Tools (DEV only) -->
    ${DEV_MODE ? `
      <section class="overview-section">
        <details class="dev-panel">
          <summary>🧪 Developer Tools</summary>

          <div class="dev-panel-body">
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <input
                id="test-device-id"
                placeholder="Device ID (e.g. Pump-1)"
                style="padding:6px;"
              />

              <button onclick="window.testFailure()">⛔ Failure</button>
              <button onclick="window.testRecoveryStart()">🔄 Recovery Start</button>
              <button onclick="window.testRecoverySuccess()">✅ Recovery Success</button>
              <button onclick="window.testQuarantine()">🧊 Quarantine</button>
              <button onclick="window.testRelease()">🔓 Release</button>
              <button onclick="window.resetRecoveryTest()">♻️ Reset Test State</button>
            </div>
          </div>
        </details>
      </section>
    ` : ""}
  `;
}


function getFilteredAlerts() {
  // alert.list.js already maintains filtered view via dashboard
  // safest way: read rendered alerts from store
  return store.alerts || [];
}

function bindAnimalClicks() {
  document.querySelectorAll(".animal-card").forEach(card => {
    card.addEventListener("click", () => {
      loadPage(card.dataset.page);
    });
  });
}

// 🧪 TASK-86: manual recovery test helpers

function getTestDeviceId() {
  const el = document.getElementById("test-device-id");
  return el?.value || "TEST-DEVICE";
}

// 🔁 Global hook for incident/stability UI
window.refreshIncidentStabilityUI = function () {
  try {
    renderIncidentPanel("incident-panel");
    renderStabilityPanel("stability-panel");
  } catch (e) {
    // page not mounted yet
  }
};

window.testFailure = function () {
  const deviceId = getTestDeviceId();
  auditStore.log({
    type: "FAILURE",
    deviceId,
    reason: "MANUAL_TEST"
  });
};


window.testRecoveryStart = function () {
  if (!DEV_MODE) {
    alert("Test harness disabled in production");
    return;
  }
  const deviceId = getTestDeviceId();
  onRecoveryStart(deviceId);
};


window.testRecoverySuccess = function () {
  if (!DEV_MODE) {
    alert("Test harness disabled in production");
    return;
  }
  const deviceId = getTestDeviceId();
  onDeviceOnline(deviceId);
};


window.testQuarantine = function () {
  if (!DEV_MODE) {
    alert("Test harness disabled in production");
    return;
  }
  const deviceId = getTestDeviceId();
  quarantineDevice(deviceId);
  auditStore.log({
    type: "QUARANTINED",
    deviceId,
    reason: "MANUAL_TEST"
  });
};

window.testRelease = function () {
  if (!DEV_MODE) {
    alert("Test harness disabled in production");
    return;
  }
  const deviceId = getTestDeviceId();
  releaseDevice(deviceId);
  auditStore.log({
    type: "MANUAL_RELEASE",
    deviceId,
    reason: "MANUAL_TEST"
  });
};
window.resetRecoveryTest = function () {
  if (!DEV_MODE) {
    alert("Test harness disabled in production");
    return;
  }
  if (!DEV_MODE) return;

  // clear audit logs
  if (getAuditHistory) {
    const h = getAuditHistory();
    if (h.clear) h.clear();
  }
   auditStore.clear();
  alert("Recovery test state reset");
};

window.exportAlertsCSV = function () {
  exportAlertsAsCSV(getFilteredAlerts());
};

window.exportAlertsJSON = function () {
  exportAlertsAsJSON(getFilteredAlerts());
};

let unsubscribeOverview = null;

export function onOverviewMounted() {
  console.log("[Overview] mounted");

  bindAnimalClicks();
  renderRestartHistory();
  renderAlertTrendGraph();
  renderDeviceList();

if (store.subscribe) {
  store.subscribe(() => {
    renderDeviceList();
  });
}

  const el = document.getElementById("recovery-insight-mini");
  if (el) renderRecoveryMiniInsight(el);

  if (store.subscribe) {
    if (unsubscribeOverview) unsubscribeOverview();

    unsubscribeOverview = store.subscribe(() => {
      const el = document.getElementById("recovery-insight-mini");
      if (el) renderRecoveryMiniInsight(el);
    });
  }
    // 🧠 Phase-2.7 / Phase-3.1 UI render (store-driven)

  // initial render
  renderIncidentPanel("incident-panel");
  renderStabilityPanel("stability-panel");

  // re-render on store updates
  if (store.subscribe) {
    store.subscribe(() => {
      renderIncidentPanel("incident-panel");
      renderStabilityPanel("stability-panel");
    });
  }
    // 🔁 Re-render overview on sensor updates
  if (store.subscribe) {
    store.subscribe(() => {
      rerenderOverview();
    });
  }
  // 🌡 Live sensor updates
 let sensorRenderTimer = null;

window.addEventListener("sensor:update", () => {
  if (sensorRenderTimer) return;

  sensorRenderTimer = setTimeout(() => {
    rerenderOverview();
    sensorRenderTimer = null;
  }, 300); // 300ms debounce
});

}


function rerenderOverview() {
  const container = document.getElementById("page-container");
  if (!container) return;

  container.innerHTML = OverviewPage();
  onOverviewMounted();
}

function renderDeviceList() {
  const el = document.getElementById("device-list");
  if (!el) return;

  const devices = deviceStore.getAll();

  if (devices.length === 0) {
    el.innerHTML = "<li>No devices connected</li>";
    return;
  }

  el.innerHTML = devices
    .map(d => `
      <li style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
        <span>${d.status === "online" ? "🟢" : "🔴"}</span>
        <strong>${d.deviceId}</strong>
        <small style="opacity:.6;">
          last seen ${Math.round((Date.now() - d.lastSeen)/1000)}s ago
        </small>
      </li>
    `)
    .join("");
}
