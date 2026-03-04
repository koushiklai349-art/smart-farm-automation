// backend/phase-d/identity/device.identity.store.js
const devices = new Map();

function registerDevice(deviceId, secret) {
  devices.set(deviceId, { secret, status: "ACTIVE" });
}

function getDevice(deviceId) {
  return devices.get(deviceId);
}

function revokeDevice(deviceId) {
  if (devices.has(deviceId)) {
    devices.get(deviceId).status = "REVOKED";
  }
}

module.exports = {
  registerDevice,
  getDevice,
  revokeDevice
};
