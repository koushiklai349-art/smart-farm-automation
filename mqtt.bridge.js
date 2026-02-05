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

  // OTA ACK
  if (cmdId && cmdId.startsWith("OTA-")) {
    const version = cmdId.replace("OTA-", "");

    store.ota = store.ota || {};
    store.ota[device_id] = store.ota[device_id] || {};

    if (status === "SUCCESS") {
      store.ota[device_id].status = "DONE";
      store.ota[device_id].currentVersion = version;
      store.ota[device_id].lastUpdate = new Date().toISOString();
      store.ota[device_id].targetVersion = null;

      console.log(`🎉 OTA DONE for ${device_id} → v${version}`);
    } else {
      store.ota[device_id].status = "FAILED";
      store.ota[device_id].errorAt = new Date().toISOString();

      console.log(`❌ OTA FAILED for ${device_id}`);
    }

    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
    return;
  }

  // (existing command ACK logic stays)
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

function publishOTACommands() {
  const store = JSON.parse(fs.readFileSync(STORE_FILE));

  Object.entries(store.ota || {}).forEach(([deviceId, ota]) => {
    if (ota.status !== "PENDING") return;

    const payload = {
      type: "OTA",
      version: ota.targetVersion,
      url: ota.url
    };

    client.publish(
      `smartfarm/${deviceId}/ota`,
      JSON.stringify(payload)
    );

    ota.status = "SENT";
    ota.sentAt = new Date().toISOString();

    console.log(`🚀 OTA sent to ${deviceId}`);
  });

  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

setInterval(publishOTACommands, 5000);
