// backend/phase-e/handlers/device.status.handler.js

const { runtime } = require("../../store/runtime.store.js");
const heartbeatService = require("../../services/heartbeat.service");

function handleDeviceStatus(payload) {
  const { deviceId, status, lastSeen } = payload;

  if (!deviceId) return;

  // -------- CORE TRUTH UPDATE --------
  // Any status / heartbeat implies device is alive
  heartbeatService.recordHeartbeat(
    deviceId,
    lastSeen || Date.now()
  );
  // ----------------------------------

  // Runtime (UI / fast access) state
  runtime.devices = runtime.devices || {};

  runtime.devices[deviceId] = {
    ...(runtime.devices[deviceId] || {}),
    status,
    lastSeen: lastSeen || Date.now()
  };

  console.log("[PHASE-E][STATUS]", deviceId, status);
}

module.exports = {
  handleDeviceStatus
};
