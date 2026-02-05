import { updateSensor } from "../store/sensor.store.js";
import { deviceStore } from "../devices/device.store.js";

let client = null;

const DEV_MODE = true;

export function getMQTT() {
  if (client) return client;

  const url = DEV_MODE
    ? "wss://broker.hivemq.com:8884/mqtt"
    : "ws://localhost:9001";

  client = window.mqtt.connect(url, {
  keepalive: 30,
  reconnectPeriod: 3000,
  connectTimeout: 30_000,
  clean: true
});


  client.on("connect", () => {
    console.log("🟢 MQTT connected:", url);

    // 🔒 SUBSCRIBE (FREEZE)
    client.subscribe("smartfarm/+/telemetry");
    client.subscribe("smartfarm/+/status");
  });

  client.on("message", (topic, payload) => {
  const raw = payload.toString().trim();

  if (!raw.startsWith("{")) {
    console.warn("⚠️ Non-JSON MQTT payload ignored:", topic, raw);
    return;
  }

  try {
    // ❗ only handle telemetry
    if (!topic.endsWith("/telemetry")) return;

    const data = JSON.parse(raw);

    // 🖥 device heartbeat (CRITICAL for command page)
    if (data.device_id) {
     deviceStore.update(data.device_id, {
     status: "online"
     });
    }

    if (data.temperature !== undefined) {
      updateSensor("temperature", data.temperature);
    }
    if (data.humidity !== undefined) {
      updateSensor("humidity", data.humidity);
    }
    if (data.soil_moisture !== undefined) {
      updateSensor("soil_moisture", data.soil_moisture);
    }

    console.log("📩 Telemetry received", data);

  } catch (e) {
    console.error("MQTT JSON parse error:", raw, e);
  }
});




  client.on("close", () => {
  console.warn("🟡 MQTT connection closed");
});

client.on("reconnect", () => {
  console.log("🔄 MQTT reconnecting...");
});


  return client;
}
