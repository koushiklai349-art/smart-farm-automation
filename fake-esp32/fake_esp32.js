/**
 * Fake ESP32 Simulator
 * --------------------
 * - Connects to MQTT (TLS)
 * - Publishes telemetry
 * - Listens for commands
 * - Verifies HMAC signature
 * - Sends ACK
 */

const mqtt = require("mqtt");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// ================= CONFIG =================
const FARM_ID = "farm-01";
const DEVICE_ID = "esp32_001";
const DEVICE_SECRET = "MOCK_SECRET";

const MQTT_URL = process.env.MQTT_URL;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

// ================= MQTT TOPICS =================
const TOPICS = {
  command: `farm/${FARM_ID}/device/${DEVICE_ID}/command`,
  ack: `farm/${FARM_ID}/device/${DEVICE_ID}/ack`,
  telemetry: `farm/${FARM_ID}/device/${DEVICE_ID}/telemetry`
};

// ================= MQTT CLIENT =================
const client = mqtt.connect(MQTT_URL, {
  username: "fake-esp32",
  password: MQTT_PASSWORD,
  ca: fs.readFileSync(
    path.join(__dirname, "certs", "ca.crt")
  ),
  rejectUnauthorized: true,
  clientId: `fake-esp32-${DEVICE_ID}`,
  clean: false
});

// ================= HELPERS =================
function verifySignature(cmd) {
  const data =
    `${cmd.commandId}|` +
    `${cmd.deviceId}|` +
    `${cmd.action}|` +
    `${cmd.issuedAt}`;

  const expected = crypto
    .createHmac("sha256", DEVICE_SECRET)
    .update(data)
    .digest("hex");

  return expected === cmd.signature;
}

function sendAck(commandId, status) {
  const payload = {
    commandId,
    deviceId: DEVICE_ID,
    status,
    executedAt: new Date().toISOString()
  };

  client.publish(
    TOPICS.ack,
    JSON.stringify(payload),
    { qos: 1 }
  );

  console.log("[ESP32][ACK]", payload);
}

function publishTelemetry() {
  const payload = {
    deviceId: DEVICE_ID,
    recordedAt: new Date().toISOString(),
    sensors: {
      temperature: 20 + Math.random() * 10,
      humidity: 40 + Math.random() * 20,
      soil_moisture: 20 + Math.random() * 40
    }
  };

  client.publish(
    TOPICS.telemetry,
    JSON.stringify(payload),
    { qos: 1 }
  );

  console.log("[ESP32][TELEMETRY]", payload.sensors);
}

// ================= MQTT EVENTS =================
client.on("connect", () => {
  console.log("🟢 Fake ESP32 connected to MQTT");

  client.subscribe(TOPICS.command, { qos: 1 });
  console.log("📡 Subscribed:", TOPICS.command);

  // Telemetry every 5 sec
  setInterval(publishTelemetry, 5000);
});

client.on("message", (topic, message) => {
  if (topic !== TOPICS.command) return;

  console.log("[ESP32][CMD RAW]", message.toString());

  let cmd;
  try {
    cmd = JSON.parse(message.toString());
  } catch {
    return sendAck("UNKNOWN", "FAILED");
  }

  if (cmd.deviceId !== DEVICE_ID) {
    return sendAck(cmd.commandId, "FAILED");
  }

  if (!verifySignature(cmd)) {
    return sendAck(cmd.commandId, "INVALID_SIGNATURE");
  }

  console.log("[ESP32][CMD OK]", cmd.action);

  // Fake execution delay
  setTimeout(() => {
    sendAck(cmd.commandId, "SUCCESS");
  }, 800);
});

client.on("error", err => {
  console.error("❌ MQTT error", err.message);
});
