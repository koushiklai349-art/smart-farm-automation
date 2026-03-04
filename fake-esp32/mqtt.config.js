const mqtt = require("mqtt");
const fs = require("fs");
const path = require("path");

function connectMqtt() {
  const client = mqtt.connect(process.env.MQTT_URL, {
    username: "fake-esp32",
    password: process.env.MQTT_PASSWORD,

    ca: fs.readFileSync(
      path.join(__dirname, "../backend/certs/ca.crt")
    ),
    rejectUnauthorized: true,

    clientId: "fake-esp32-001",
    clean: false,
    reconnectPeriod: 2000
  });

  client.on("connect", () => {
    console.log("🤖 Fake ESP32 connected to MQTT");
  });

  client.on("error", err => {
    console.error("MQTT error:", err.message);
  });

  return client;
}

module.exports = {
  connectMqtt
};
