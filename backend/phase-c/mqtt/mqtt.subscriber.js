const { getMqttClient } = require("./mqtt.client.js");
const { ackTopic, errorTopic } = require("./mqtt.topics.js");
const { handleDeviceAck } = require("../../phase-b/integration/device.ack.handler.js");
const { handleDeviceError } = require("../../phase-b/integration/device.error.handler.js");

function startMqttSubscribers(farmId, deviceId) {
  const client = getMqttClient();

  client.subscribe(
    [
      ackTopic(farmId, deviceId),
      errorTopic(farmId, deviceId)
    ],
    { qos: 1 }
  );

  client.on("message", (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());

      if (topic.endsWith("/ack")) {
        handleDeviceAck(payload);
      }

      if (topic.endsWith("/error")) {
        handleDeviceError(payload);
      }
    } catch (err) {
      console.error("[MQTT] invalid message payload", err.message);
    }
  });
}

module.exports = {
  startMqttSubscribers
};
