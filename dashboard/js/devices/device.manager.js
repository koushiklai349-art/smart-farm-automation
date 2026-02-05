// dashboard/js/devices/device.manager.js

import { deviceStore } from "../store/device.store.js";
import { getActionRisk } from "../learning/action.risk.engine.js";
import { addAuditEntry } from "../audit/audit.history.js";
import { raiseConfidenceWarning } from "../core/alert/alert.manager.js";

// 🔁 confidence history (in-memory)
const confidenceHistory = new Map();

/**
 * Execute command on device (unchanged behavior)
 */
export function executeDeviceCommand(action) {
  const { deviceId, action: cmd } = action;

  deviceStore.update(deviceId, {
    lastCommand: cmd,
    status: "COMMAND_SENT"
  });
}

/**
 * Get raw device state
 */
export function getDeviceState(deviceId) {
  return deviceStore.get(deviceId);
}

/**
 * 🧠 Device confidence score (0–100)
 */
export function getDeviceConfidence(deviceId) {
  const device = deviceStore.get(deviceId);
  if (!device) return null;

  let score = 100;
  const reasons = [];

  if (typeof device.healthScore === "number") {
    if (device.healthScore < 40) {
      score -= 40;
      reasons.push("LOW_HEALTH");
    } else if (device.healthScore < 70) {
      score -= 20;
      reasons.push("MEDIUM_HEALTH");
    }
  }

  if (device.recentFailures >= 3) {
    score -= 30;
    reasons.push("RECENT_FAILURES");
  }

  if (device.lastCommand) {
    const risk = getActionRisk(deviceId, device.lastCommand);
    if (risk?.level === "HIGH") {
      score -= 30;
      reasons.push("ACTION_RISK_HIGH");
    } else if (risk?.level === "MEDIUM") {
      score -= 15;
      reasons.push("ACTION_RISK_MEDIUM");
    }
  }

  score = Math.max(0, Math.min(score, 100));

  let level = "HIGH";
  if (score < 40) level = "LOW";
  else if (score < 70) level = "MEDIUM";

  return { score, level, reasons };
}

/**
 * 📈 Device confidence trend
 * UP | DOWN | STABLE
 * + audit + soft warning alert on degradation
 */
export function getDeviceConfidenceTrend(deviceId) {
  const prev = confidenceHistory.get(deviceId);
  const current = getDeviceConfidence(deviceId)?.score;

  if (typeof current !== "number") return "STABLE";

  let trend = "STABLE";
  if (typeof prev === "number") {
    if (current > prev) trend = "UP";
    else if (current < prev) trend = "DOWN";
  }

  if (trend === "DOWN") {
    // 📜 Audit
    addAuditEntry({
      type: "DEVICE_CONFIDENCE",
      deviceId,
      prevScore: prev,
      currentScore: current,
      reason: "CONFIDENCE_DEGRADING",
      time: Date.now()
    });

    // ⚠️ Soft warning alert (Phase-9.5)
    raiseConfidenceWarning(deviceId, {
      prevScore: prev,
      currentScore: current
    });
  }

  confidenceHistory.set(deviceId, current);
  return trend;
}

/**
 * 📡 Handle incoming telemetry (Phase-2.1)
 */
export function handleDeviceTelemetry(payload) {
  if (!payload?.deviceId) return;

  deviceStore.update(payload.deviceId, {
    telemetry: {
      temperature: payload.temperature,
      humidity: payload.humidity,
      soil_moisture: payload.soil_moisture
    }
  });
}

/**
 * ⏱️ Offline detection (Phase-2.1)
 */
export function checkDeviceOffline(timeoutMs = 15000) {
  const now = Date.now();

  deviceStore.getAll().forEach(device => {
    if (
      device.status === "online" &&
      now - device.lastSeen > timeoutMs
    ) {
      deviceStore.markOffline(device.deviceId);
    }
  });
}
