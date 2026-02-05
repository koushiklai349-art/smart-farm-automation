import { runRuleEngine } from "../rule-engine/rule.engine.js";
import { deviceStore } from "../devices/device.store.js";
import { updateSensor } from "../store/sensor.store.js";
import { evaluateRules } from "../rule-engine/rule.engine.js";
import { getSensorSnapshot } from "../store/sensor.store.js";

export function onSensorData(sensorType, value) {
  console.log("SENSOR:", sensorType, value);

  // 1️⃣ update sensor snapshot
  updateSensor(sensorType, value);

  // 2️⃣ evaluate rules ONCE
  runRuleEngine();
  evaluateRules(getSensorSnapshot());

}

// ✅ NEW: Firmware telemetry adapter
export function handleDeviceTelemetry(payload) {
  if (!payload || !payload.device_id) return;

  const deviceId = payload.device_id;

  // 🖥 auto-detect / heartbeat
  deviceStore.update(deviceId, {
    status: "online"
  });

  // 🌡 sensors
  if (typeof payload.temperature === "number") {
    onSensorData("temperature", payload.temperature);
  }

  if (typeof payload.humidity === "number") {
    onSensorData("humidity", payload.humidity);
  }

  if (typeof payload.soil_moisture === "number") {
    onSensorData("soil_moisture", payload.soil_moisture);
  }
}

// STEP 4.1 — device actuator state sync
export function handleDeviceState(payload) {
  if (!payload?.deviceId) return;

  // expected payload example:
  // {
  //   deviceId: "esp32_001",
  //   actuators: { pump: "ON", fan: "OFF" }
  // }

  if (payload.actuators) {
    deviceStore.update(payload.deviceId, {
      actuators: payload.actuators
    });

    console.log(
      "🔄 Device state updated:",
      payload.deviceId,
      payload.actuators
    );
  }
}

