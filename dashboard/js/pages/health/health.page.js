import { getDeviceHealth } from "../../health/system.health.js";
import { deviceStore } from "../../devices/device.store.js";
import { renderHealthTimeline } from "../../components/health.timeline.js";
import { renderHealthScore } from "../../components/health.score.card.js";
import { renderHealthDebugPanel } from "../../components/health.debug.panel.js";
import { EmptyState } from "../../components/empty.state.js";

let lastHealthSignature = "";
let lastHealthHTML = "";

export function HealthPage() {
  // 🔧 DEV ONLY: seed health data once
if (!window.__DEV_HEALTH_SEEDED__) {
  window.__DEV_HEALTH_SEEDED__ = true;

  // fake health score
  window.__healthScore = 85;

  // fake history
  import("../../health/health.history.store.js")
    .then(m => {
      m.addHealthEvent("ok");
      m.addHealthEvent("warning");
    })
    .catch(() => {});
}

  let devices = deviceStore.getAll().map(d => d.id);

// 🔧 DEV fallback
if (!devices.length) {
  devices = ["Pump-1", "Fan-1", "Sensor-1"];
}

  const health = getDeviceHealth(devices);
  const safeHealth = Array.isArray(health) ? health : [];
  // 🧼 STEP-C.2: empty / not-ready health state
   if (safeHealth.length === 0) {
  return `
    <h2>🩺 System Health</h2>
    ${EmptyState({
      icon: "🩺",
      title: "Health data not ready",
      hint: "System health will appear once devices report status"
    })}
  `;
  }

  const signature = JSON.stringify(
    safeHealth.map(h => [h.deviceId, h.failures, h.quarantined])
  );

  if (signature === lastHealthSignature) {
    return lastHealthHTML; // ⏭️ skip re-render
  }

  // 👉 HTML return only
 setTimeout(() => {
  const debugBtn = document.getElementById("toggle-health-debug");
  const debugEl = document.getElementById("health-debug");

  if (debugBtn && debugEl) {
    debugBtn.onclick = () => {
      const open = debugEl.style.display !== "none";
      debugEl.style.display = open ? "none" : "block";
      debugBtn.textContent = open
        ? "🧪 Show Debug Panel"
        : "❌ Hide Debug Panel";

      // render only when opened
      if (!open) {
        renderHealthDebugPanel(debugEl);
      }
    };
  }

    const timelineEl = document.getElementById("health-timeline");
    if (timelineEl) {
      renderHealthTimeline(timelineEl);
    }

    const scoreEl = document.getElementById("health-score");
    if (scoreEl && window.__healthScore != null) {
      renderHealthScore(scoreEl, window.__healthScore);
    }
  }, 0);

    const html = `
    <div class="health-page">
      <h2>🩺 System Health</h2>

      <div id="health-score"></div>

      <div id="health-timeline"></div>
        
      <div class="health-debug-wrap">
  <button id="toggle-health-debug" class="debug-toggle-btn">
    🧪 Show Debug Panel
  </button>

  <div id="health-debug" style="display:none;"></div>
</div>


      <table>
        <thead>
          <tr>
            <th>Device</th>
            <th>Failures</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
         ${safeHealth.map(renderRow).join("")}
        </tbody>
      </table>
    </div>
  `;

  lastHealthSignature = signature;
  lastHealthHTML = html;

  return html;

}


function renderRow(h) {
  const status = h.quarantined
    ? { label: "QUARANTINED", cls: "danger", icon: "🚫" }
    : h.failures > 0
    ? { label: "WARNING", cls: "warn", icon: "⚠️" }
    : { label: "HEALTHY", cls: "ok", icon: "✅" };

  return `
    <tr class="health-row ${status.cls}">
      <td>
        <strong>${h.deviceId}</strong>
      </td>

      <td>
        <span class="failure-count">
          ${h.failures}
        </span>
      </td>

      <td>
        <span class="health-badge ${status.cls}">
          ${status.icon} ${status.label}
        </span>
      </td>
    </tr>
  `;
}

window.openDeviceRecovery = function (deviceId) {
  if (!deviceId) return;

  // Recovery page with device filter
  window.location.hash = `#/recovery?deviceId=${deviceId}`;
};
