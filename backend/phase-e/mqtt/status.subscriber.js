// backend/phase-e/mqtt/status.subscriber.js

const { getMqttClient } = require("../../phase-c/mqtt/mqtt.client.js");
const { handleDeviceStatus } = require("../handlers/device.status.handler.js");

function startStatusSubscriber(farmId, deviceId) {
  const client = getMqttClient();
  const topic = `farm/${farmId}/device/${deviceId}/status`;

  client.subscribe(topic, { qos: 1 });

  client.on("message", (t, message) => {
    if (t !== topic) return;

    try {
      const payload = JSON.parse(message.toString());
      handleDeviceStatus(payload);
    } catch (err) {
      console.error("[PHASE-E][STATUS] invalid payload", err.message);
    }
  });
}

module.exports = {
  startStatusSubscriber
};
