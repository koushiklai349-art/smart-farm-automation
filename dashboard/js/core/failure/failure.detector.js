// /core/failure/failure.detector.js
import { FAILURE_TYPE } from "./failure.types.js";
import { auditStore } from "../audit/audit.store.js";

const COMMAND_TIMEOUT = 8000; // ms

export function attachFailureDetector(cmd, mqttClient) {
  let finished = false;

  // ⏱ Timeout Detector
  const timer = setTimeout(() => {
    if (finished) return;

    finished = true;
    reportFailure(cmd, FAILURE_TYPE.TIMEOUT, "Command timeout");
  }, COMMAND_TIMEOUT);

  // 📡 MQTT Error Detector
  mqttClient?.on("error", (err) => {
    if (finished) return;

    finished = true;
    clearTimeout(timer);
    reportFailure(cmd, FAILURE_TYPE.MQTT_ERROR, err.message);
  });

  // ✅ Success Hook (call from executor)
  cmd.__markSuccess = () => {
    if (finished) return;

    finished = true;
    clearTimeout(timer);
  };
}

function reportFailure(cmd, type, reason) {
  auditStore.add({
    type: "COMMAND_FAILURE",
    commandId: cmd.id,
    deviceId: cmd.deviceId,
    failureType: type,
    reason,
    timestamp: Date.now()
  });
}
