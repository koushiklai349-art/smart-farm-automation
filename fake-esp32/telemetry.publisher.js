const { getMqttClient } = require("./mqtt.client");
const { telemetryTopic } = require("./mqtt.topics");

function startTelemetry(deviceId, farmId) {
  const client = getMqttClient();

  setInterval(() => {
    const payload = {
      deviceId,
      timestamp: new Date().toISOString(),
      sensors: {
        temperature: 25 + Math.random() * 5,
        humidity: 55 + Math.random() * 10,
        soil_moisture: 30 + Math.random() * 20
      },
      state: "IDLE"
    };

    client.publish(
      telemetryTopic(farmId, deviceId),
      JSON.stringify(payload),
      { qos: 0 }
    );

    console.log("📡 Telemetry sent", payload.sensors);
  }, 5000);
}

module.exports = {
  startTelemetry
};
