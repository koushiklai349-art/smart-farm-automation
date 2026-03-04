const bus = require("./mqtt.mock.bus");
const { getMqttClient } = require("./mqtt.client.js");

function publishCommand({ deviceId, command }) {

  if (process.env.MQTT_MODE === "mock") {
    const topic = `cmd/${deviceId}`;
    console.log("[MOCK MQTT] COMMAND →", topic, command);
    bus.publish(topic, command);
    return;
  }

  const client = getMqttClient();
  const topic = `cmd/${deviceId}`;
  console.log("[REAL MQTT] COMMAND →", topic, command);

  client.publish(topic, JSON.stringify(command), { qos: 1 });
}

module.exports = {
  publishCommand
};