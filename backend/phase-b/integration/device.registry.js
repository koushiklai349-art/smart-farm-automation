// phase-b/integration/device.registry.js

const devices = new Map();

const controllerRegistryService = require("../../services/controller.registry.service");

/**
 * Called when a device (ESP32) boots and sends registration
 */
function registerDevice({
  instanceId,
  controllerClassId,
  hardwareUid,
  meta = {}
}) {
  // Register into core registry (persistent)
  const controllerInstance =
    controllerRegistryService.register({
      instanceId,
      controllerClassId,
      hardwareUid,
      meta
    });

  // Mark device seen in Phase-B runtime map
  devices.set(controllerInstance.id, {
    hardwareUid,
    registeredAt: Date.now()
  });

  return controllerInstance;
}

/**
 * Phase-B quick online check (runtime only)
 */
function isDeviceOnline(deviceId) {
  return devices.has(deviceId);
}

module.exports = {
  registerDevice,
  isDeviceOnline
};
 