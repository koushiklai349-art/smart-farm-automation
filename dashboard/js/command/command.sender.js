// src/commands/command.sender.js

import { updateCommand } from "./command.store.js";
import { auditStore } from "../audit/audit.store.js";  
import { metricsStore } from "../audit/metrics.store.js"; 
import { getSystemHealthScore } from "../health/system.health.js";

export function sendCommand(mqttClient, command) {
  // ✅ Firmware-compatible topic
  const topic = `farm/${command.deviceId}/cmd`;

  // ✅ Firmware-compatible payload
  const payload = JSON.stringify({
    cmd: command.action
  });

  const delay = getHealthAwareDelay();

  setTimeout(() => {
    mqttClient.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        updateCommand(command.id, {
          status: "failed",
          lastError: err.message,
          completedAt: Date.now()
        });
        return;
      }

      updateCommand(command.id, {
        status: "sent",
        sentAt: Date.now()
      });

      auditStore.add({
        type: "command_sent",
        refId: command.id,
        meta: { deviceId: command.deviceId }
      });

      metricsStore.increment("commands_sent");

      // DEV hook remains untouched
      document.dispatchEvent(
        new CustomEvent("command:sent", {
          detail: command
        })
      );
    });
  }, delay);
}

function getHealthAwareDelay() {
  const health = getSystemHealthScore();
  if (health >= 70) return 0;
  if (health >= 40) return 500;
  return 1500;
}
