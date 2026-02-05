const mqtt = require("mqtt");

const DEVICE_ID = "esp32_001";
const BROKER = "mqtt://broker.hivemq.com";

const BASE = `smartfarm/${DEVICE_ID}`;

const client = mqtt.connect(BROKER);

let pump = "OFF";
let fan = "OFF";
let water_pump = "OFF";

client.on("connect", () => {
  console.log("🟢 Virtual ESP32 connected");

  // subscribe command
  client.subscribe(`${BASE}/command`);

  // online status
  client.publish(
    `${BASE}/status`,
    JSON.stringify({
      device_id: DEVICE_ID,
      state: "online"
    }),
    { retain: true }
  );

  // telemetry loop
  setInterval(() => {
    client.publish(
      `${BASE}/telemetry`,
      JSON.stringify({
        device_id: DEVICE_ID,
        temperature: 25 + Math.random() * 5,
        humidity: 50 + Math.random() * 10,
        water_level: 40 + Math.random() * 40,
        soil_moisture: 40 + Math.random() * 10,
        pump,
        fan,
        water_pump
      })
    );
  }, 5000);
});

client.on("message", (topic, payload) => {
  if (!topic.endsWith("/command")) return;

  let cmd;
  try {
    cmd = JSON.parse(payload.toString());
  } catch {
    return;
  }

  console.log("📥 Command received:", cmd);

  const { cmdId, target, action } = cmd;

  let success = true;

  if (target === "pump") {
    pump = action;
  } else if (target === "fan") {
    fan = action;
  } else if (target === "water_pump") {
  water_pump = action;
  } else {
    success = false;
  }

  // ACK back
  client.publish(
    `${BASE}/ack`,
    JSON.stringify({
      cmdId,
      device_id: DEVICE_ID,
      status: success ? "SUCCESS" : "FAILED"
    })
  );
});
