const VIRTUAL_DEVICES = [
  { deviceId: "esp32-fish-01", type: "fish" },
  { deviceId: "esp32-cow-01",  type: "cow"  },
  { deviceId: "esp32-goat-01", type: "goat" }
];

window.__FAKE_ESP32_MODE__ = {
  outcome: "SUCCESS" // SUCCESS | FAILED | NO_EFFECT
};

import { getMQTT } from "../mqtt/mqtt.client.js";
import { autoResolveTick } from "../incident/incident.engine.js";
import { devIngestEvent } from "../dev/incident.flow.dev.js";


/**
 * Fake ESP32 simulator (DEV_MODE)
 * Sends ACK directly via MQTT client
 */
export function initFakeESP32() {
  const mqtt = getMQTT();

  // 🔁 start telemetry for all devices
  VIRTUAL_DEVICES.forEach(startTelemetry);

  setInterval(() => {
    autoResolveTick();
  }, 30 * 1000); // every 30 sec

  document.addEventListener("command:sent", e => {
    const cmd = e.detail;
    if (!cmd || !cmd.id) return;

    const delay = 1000 + Math.random() * 2000;

    setTimeout(() => {
      const status =
        window.__FAKE_ESP32_MODE__?.outcome || "SUCCESS";

      const ack = {
        cmdId: cmd.id,
        deviceId: cmd.deviceId,
        status,
        at: Date.now()
      };

     if (mqtt.connected) {
       mqtt.publish(
        `farm/${cmd.deviceId}/ack`,
       JSON.stringify(ack)
      );
     } else {
      console.warn("⚠️ MQTT not connected, ACK skipped");
     }

    }, delay);
  });
}


function startTelemetry(device) {
  const mqtt = getMQTT();

  setInterval(() => {
    const payload = {
      deviceId: device.deviceId,
      temperature: 20 + Math.random() * 10,
      humidity: 40 + Math.random() * 20,
      soil_moisture: 30 + Math.random() * 40,
      at: Date.now()
    };

    const topic = `farm/${device.deviceId}/telemetry`;
     if (mqtt.connected) {
     mqtt.publish(topic, JSON.stringify(payload));
       } else {
        console.warn(
      "⚠️ MQTT not connected, telemetry skipped:",
       device.deviceId
      );
    }


    // 🔥 DEV: randomly inject incident event
    if (Math.random() < 0.1) { // 10% chance
      devIngestEvent({
        deviceId: device.deviceId,
        controllerId: "FAKE_ESP32",
        capability: "WATER_PUMP",
        type: "TIMEOUT",
        at: Date.now(),
      });
    }

  }, 5000);
}
