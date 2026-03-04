const auditStore = require("../../store/audit.store.js");
const { recoveryEngine } = require("../../recovery/recovery.engine.js");
const bus = require("../../phase-c/mqtt/mqtt.mock.bus");

async function sendToDevice(command) {
  try {
    auditStore.logCommandIssued(command);

    // 🔥 publish to mock bus
    bus.publish(`cmd/${command.deviceId}`, command);

    return { status: "SENT" };
  } catch (err) {
    recoveryEngine.trigger(command, err);
    throw err;
  }
}

module.exports = {
  sendToDevice
};