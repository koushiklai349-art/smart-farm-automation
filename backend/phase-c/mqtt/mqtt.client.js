const mqtt = require("mqtt");
const fs = require("fs");
const path = require("path");

let client;

function getMqttClient() {
  if (client) return client;

  client = mqtt.connect(process.env.MQTT_URL, {
    // DO NOT re-specify port if URL already has it
    username: "backend-core",
    password: process.env.MQTT_PASSWORD,

    ca: fs.readFileSync(
      path.join(__dirname, "../../certs/ca.crt")
    ),
    rejectUnauthorized: true,

    clientId: "backend-core-secure",
    clean: false,
    reconnectPeriod: 2000
  });

  client.on("connect", () => {
    console.log("[MQTT] secure connection established");
  });

  client.on("error", (err) => {
    console.error("[MQTT] TLS error", err.message);
  });

  return client;
}

module.exports = {
  getMqttClient
};
