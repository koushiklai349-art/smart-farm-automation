// device.feedback.handler.js
import { commandStore } from "../store/command.store.js";
import { deviceStore } from "../store/device.store.js";
import { runRuleEngine } from "../rule-engine/rule.engine.js";

export function handleDeviceFeedback(feedback) {
  const {
    commandId,
    deviceId,
    status,
    currentState,
    message,
  } = feedback;

  // 🔹 update command status
  commandStore.update(commandId, {
    status,
    message,
  });

  // 🔹 update device state
  deviceStore.update(deviceId, {
    ...currentState,
    lastSeen: Date.now(),
  });
}

