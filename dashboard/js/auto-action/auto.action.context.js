// dashboard/js/auto-action/auto.action.context.js

import { getHealthScore } from "../health/health.score.engine.js";
import { failureCorrelationStore } from "../failure/failure.correlation.store.js";
import { deviceStore } from "../devices/device.store.js";
import { ALERT_TYPES } from "../core/alert/alert.types.js";

// 🔒 Phase-13.1-A helpers
function isNightTime(ts = Date.now()) {
  const h = new Date(ts).getHours();
  return h < 6 || h >= 19; // 7PM–6AM = night
}

function failureBurst(count) {
  return count >= 3; // soft threshold
}

// 🔒 Phase-13.2-A helpers (cost / energy)
function isPeakHour(ts = Date.now()) {
  const h = new Date(ts).getHours();
  // সাধারণভাবে peak: সকাল 8–11, সন্ধ্যা 6–10
  return (h >= 8 && h <= 11) || (h >= 18 && h <= 22);
}

function getEnergyCostLevel(ts = Date.now()) {
  if (isPeakHour(ts)) return "HIGH";
  return "LOW"; // default-safe
}
// 🔒 Phase-13.3-A helpers (shared resource snapshot)
function getActiveResources() {
  // heuristic snapshot (future: real tracker)
  return {
    pump: deviceStore.getAll?.().some(d => d.status === "PUMP_ON") || false,
    heater: deviceStore.getAll?.().some(d => d.status === "HEATER_ON") || false,
    cooler: deviceStore.getAll?.().some(d => d.status === "COOLING_ON") || false
  };
}

function getSharedLoad(active) {
  let load = 0;
  if (active.pump) load += 2;
  if (active.heater) load += 2;
  if (active.cooler) load += 2;

  if (load >= 4) return "HIGH";
  if (load >= 2) return "MEDIUM";
  return "LOW";
}


/**
 * কোনো action চালানোর আগের বর্তমান পরিস্থিতি
 */
export function getActionContext(deviceId, alert) {
  const device = deviceStore.get(deviceId);

  return {
    deviceId,

    deviceStatus: device?.status || "UNKNOWN",

    healthScore: getHealthScore(deviceId) ?? 0,

    recentFailures:
      failureCorrelationStore.getByDevice(deviceId)?.length || 0,

    isQuarantined: device?.quarantined === true,

    isPredictive:
      alert?.type === ALERT_TYPES.PREDICTIVE,

    predictiveRisk:
      alert?.riskScore ?? 0,

    // 🔒 time & stability context
    isNight: isNightTime(),
    hasFailureBurst: failureBurst(
      failureCorrelationStore.getByDevice(deviceId)?.length || 0
    ),

    // 🔒  load hint (safe default)
        loadHint: device?.load ?? "NORMAL", // LOW | NORMAL | HIGH (optional)

    // 🔒 cost / energy context
        isPeakHour: isPeakHour(),
    energyCostLevel: getEnergyCostLevel(),

    // 🔒 Phase-13.3-A: shared resource context
    activeResources: (() => {
      const active = getActiveResources();
      return active;
    })(),
    sharedLoad: (() => {
      const active = getActiveResources();
      return getSharedLoad(active);
    })(),

    timestamp: Date.now()

  };
}
