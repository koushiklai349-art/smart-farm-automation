const mqtt = require("mqtt");
const fs = require("fs");

const STORE_FILE = "./store.json";

const client = mqtt.connect("mqtt://broker.hivemq.com");

console.log("🌩 MQTT Bridge starting (cloud-safe)");

client.on("connect", () => {
  console.log("🟢 MQTT connected");
  client.subscribe("smartfarm/+/ack");
  client.subscribe("smartfarm/+/telemetry");
});

client.on("message", (topic, payload) => {
  let data;
  try {
    data = JSON.parse(payload.toString());
  } catch {
    return;
  }

  const store = JSON.parse(fs.readFileSync(STORE_FILE));

  // ACK
  if (topic.endsWith("/ack")) {
    const { device_id, cmdId, status } = data;
    const cmds = store.commandQueue?.[device_id] || [];
    const cmd = cmds.find(c => c.id === cmdId);
    if (!cmd) return;

    cmd.status = status === "SUCCESS" ? "DONE" : "FAILED";
    cmd.acked = true;

    console.log(`✅ ACK from ${device_id}`);
  }

  // TELEMETRY
  if (topic.endsWith("/telemetry")) {
    const deviceId = data.device_id;
    if (!deviceId) return;

    store.sensorData = store.sensorData || {};
    store.sensorData[deviceId] = {
      ...data,
      receivedAt: new Date().toISOString()
    };

    console.log(`📡 Telemetry ${deviceId}`);
  }

  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
});
