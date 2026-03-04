// backend/phase-d/identity/device.identity.service.js
const { getDevice, registerDevice } = require("./device.identity.store.js");
const controllerStore = require("../../store/controller.store");

// In-memory trusted devices (BOOTSTRAP only)
const trustedDevices = new Set();

function verifyDevice(deviceId) {
  return trustedDevices.has(deviceId);
}

function getDeviceSecret(deviceId) {
  const device = getDevice(deviceId);
  if (!device) return undefined;
  if (device.status !== "ACTIVE") return undefined;
  return device.secret;
}

// ✅ bootstrap helper

function bootstrapDevice(deviceId, secret) {

  // 1️⃣ Identity registration
  registerDevice(deviceId, secret);
  trustedDevices.add(deviceId);

  // 2️⃣ Controller sync
  const existing = controllerStore.getByDeviceId(deviceId);

  if (!existing) {

    controllerStore.create({
      id: deviceId,
      deviceId,
      status: "online",
      config: { mode: "AUTO" },
      location: { lineId: "line-01" },
      capabilities: ["fan", "pump"]
    });

    console.log("✅ Controller created:", deviceId);

  } else {

    controllerStore.update(existing.id, {
      status: "online",
      location: existing.location || { lineId: "line-01" },
      capabilities: existing.capabilities || ["fan", "pump"]
    });

    console.log("🔁 Controller reactivated:", deviceId);
  }
}
module.exports = {
  verifyDevice,
  getDeviceSecret,
  bootstrapDevice
};
