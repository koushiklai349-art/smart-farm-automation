const { auditStore } = require("../../store/audit.store.js");
const { recoveryEngine } = require("../../recovery/recovery.engine.js");
const { emitRuntimeEvent } = require("../../phase-c/events/runtime.events.js");

function handleDeviceError(errorPayload) {
  // 1️⃣ Audit failure
  auditStore.logCommandFailure(errorPayload);

  // 2️⃣ Trigger recovery (Phase-A engine, untouched)
  recoveryEngine.trigger(
    { commandId: errorPayload.commandId, deviceId: errorPayload.deviceId },
    errorPayload
  );

  // 3️⃣ Emit runtime error event (FIXED position)
  emitRuntimeEvent({
    type: "DEVICE_ERROR",
    deviceId: errorPayload.deviceId,
    commandId: errorPayload.commandId,
    error: errorPayload.errorCode,
    at: new Date().toISOString()
  });

  return { status: "ERROR_PROCESSED" };
}

module.exports = {
  handleDeviceError
};
