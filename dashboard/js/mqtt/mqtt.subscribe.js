// mqtt.subscribe.js
import { getMQTT } from "./mqtt.client.js";
import { handleDeviceTelemetry } from "../sensors/sensor.listener.js";
import { handleDeviceFeedback } from "../devices/device.feedback.handler.js";
import { raiseAlert } from "../core/alert/alert.manager.js";
import { handleDeviceState } from "../sensors/sensor.listener.js";


export function subscribeMQTT() {
  const client = getMQTT();

  client.subscribe("farm/+/telemetry", { qos: 1 });
  client.subscribe("farm/+/state", { qos: 1 });
  client.subscribe("farm/+/alert", { qos: 1 });

  client.on("message", (topic, payload) => {
    const data = safeParse(payload);

    if (topic.endsWith("/telemetry")) {
      handleDeviceTelemetry(data);
    }

    if (topic.endsWith("/state")) {
     handleDeviceState(data);
    }

    if (topic.endsWith("/alert")) {
    raiseAlert(
    {
      code: data.code || "DEVICE_ALERT",
      severity: data.severity || "warning",
      message: data.message || "Device alert received"
    },
    {
      deviceId: data.deviceId,
      raw: data
    }
    );
   }

  });
}

function safeParse(payload) {
  const text = payload.toString();

  try {
    return JSON.parse(text);
  } catch {
    return text; // fallback for plain strings like "on"/"off"
  }
}

