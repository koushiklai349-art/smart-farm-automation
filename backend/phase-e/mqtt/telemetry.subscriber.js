// backend/phase-e/mqtt/telemetry.subscriber.js

const { getMqttClient } = require("../../phase-c/mqtt/mqtt.client.js");
const { handleDeviceTelemetry } = require("../handlers/device.telemetry.handler.js");

function startTelemetrySubscriber(farmId, deviceId) {
  const client = getMqttClient();
  const topic = `farm/${farmId}/device/${deviceId}/telemetry`;

  client.subscribe(topic, { qos: 1 });

  client.on("message", (t, message) => {
    if (!t.endsWith("/telemetry")) return;

    try {
      const payload = JSON.parse(message.toString());

      if (!payload.deviceId || !payload.sensors) {
        throw new Error("INVALID_TELEMETRY_SHAPE");
      }

      handleDeviceTelemetry(payload);
    } catch (err) {
      console.error("[PHASE-E][TELEMETRY] invalid payload", err.message);
    }
  });
}

module.exports = {
  startTelemetrySubscriber
};
