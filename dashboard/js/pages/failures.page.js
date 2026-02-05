// dashboard/js/pages/failures.page.js

import {
  getRecentFailures,
  getFailuresByDevice
} from "../failure/failure.correlation.store.js";
import { FAILURE_TYPE } from "../core/failure/failure.types.js";
import { FailureCard } from "../components/failure.card.js";

/**
 * Helper: human-friendly label for failure type
 */
function labelForType(type) {
  switch (type) {
    case FAILURE_TYPE.TIMEOUT:
      return "Command Timeout";
    case FAILURE_TYPE.MQTT_ERROR:
      return "MQTT Error";
    case FAILURE_TYPE.DEVICE_OFFLINE:
      return "Device Offline";
    default:
      return "Unknown Failure";
  }
}

/**
 * Helper: normalize failure item for UI
 * (defensive — correlation store doesn’t enforce shape)
 */
function normalizeFailure(f) {
  return {
    id: f.id || f.commandId || "N/A",
    deviceId: f.deviceId || "SYSTEM",
    module: f.module || "System",
    component: f.component || "-",
    reason: f.reason || labelForType(f.failureType),
    failureType: f.failureType || FAILURE_TYPE.UNKNOWN,
    status: f.status || "FAILED",
    timestamp: f.timestamp || Date.now()
  };
}

function renderFailures(list) {
  if (!list.length) {
    return `<p class="empty">No active failures</p>`;
  }

  return `
    <div class="failure-grid">
      ${list.map(raw => {
        const f = normalizeFailure(raw);
        return `
          <div class="failure-item"
               data-device="${f.deviceId}"
               onclick="window.openFailureDetails('${f.deviceId}')">
            ${FailureCard(f)}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

export function FailuresPage() {
  const containerId = "failures-root";

  function render() {
    const el = document.getElementById(containerId);
    if (!el) return;

    const failures = getRecentFailures(20);
    el.innerHTML = renderFailures(failures);
  }

  // initial render
  setTimeout(render, 0);

  // live update
  window.addEventListener(
    "FAILURE_STATE_UPDATED",
    render
  );

  return `
    <section class="page">
      <h1>🛑 Failures</h1>
      <div id="${containerId}"></div>
    </section>
  `;
}


/**
 * 🔍 Drilldown only (navigation), no side-effects
 * You can later route this to a dedicated recovery/history page
 */
// keep this at bottom (navigation only)
window.openFailureDetails = function (deviceId) {
  if (!deviceId) return;
  // pass explicit intent + source
  window.location.hash = `#/history?source=failure&deviceId=${encodeURIComponent(deviceId)}`;
};
