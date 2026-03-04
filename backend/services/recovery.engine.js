const ControllerInstance = require("../models/controllerInstance.model");
const { sendToDevice } = require("../phase-b/integration/device.bridge");
const alertService = require("./alert.service");

const recoveryAttempts = {};
const MAX_RECOVERY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 10000;

async function attemptRecovery(deviceId) {

  recoveryAttempts[deviceId] =
    (recoveryAttempts[deviceId] || 0) + 1;

  const attempt = recoveryAttempts[deviceId];

  if (attempt > MAX_RECOVERY_ATTEMPTS) {

    await alertService.createAlert({
      type: "RECOVERY_FAILED",
      deviceId,
      severity: "critical",
      message: `Recovery failed after ${MAX_RECOVERY_ATTEMPTS} attempts`
    });

    console.log("❌ Recovery failed:", deviceId);
    return;
  }

  console.log(`🔄 Attempting recovery (${attempt}) for`, deviceId);

  await sendToDevice({
    deviceId,
    commandId: "recovery-" + Date.now(),
    payload: {
      target: "system",
      operation: "REBOOT"
    },
    source: "SYSTEM"
  });

  setTimeout(async () => {

    const controller = await ControllerInstance.findOne({ deviceId });

    if (controller.status !== "online") {
      await attemptRecovery(deviceId);
    } else {
      console.log("✅ Recovery successful:", deviceId);
      recoveryAttempts[deviceId] = 0;
    }

  }, RETRY_DELAY_MS);
}

module.exports = {
  attemptRecovery
};