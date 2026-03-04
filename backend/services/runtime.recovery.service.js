const { runtime } = require("../store/runtime.store");
const { persistent } = require("../store/persistent.store");

function recoverRuntimeDevices() {

  runtime.devices = runtime.devices || {};
  const persistentDevices = persistent.devices || {};

  Object.values(persistentDevices).forEach(device => {

    // 🔥 DO NOT overwrite existing runtime state
    if (!runtime.devices[device.deviceId]) {

      runtime.devices[device.deviceId] = {
        lastSeen: null,
        status: "OFFLINE",
        lineId: device.lineId || null
      };
    }
  });

  console.log("♻️ Runtime devices recovered safely");
}

module.exports = {
  recoverRuntimeDevices
};