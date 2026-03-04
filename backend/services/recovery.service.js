const Command = require("../models/command.model");
const { processCommand } = require("./command.orchestrator.service");
const { sendToDevice } = require("../phase-b/integration/device.bridge");
const ControllerInstance = require("../models/controllerInstance.model");
const { runtime } = require("../store/runtime.store");

const recoveryAttempts = {};

async function attemptRecovery(deviceId) {

  recoveryAttempts[deviceId] =
    (recoveryAttempts[deviceId] || 0) + 1;

  const level = recoveryAttempts[deviceId];

  console.log(`🔧 Recovery attempt ${level} for ${deviceId}`);

  if (level === 1) {

    console.log("🔁 LEVEL 1 → retry last command");

    const last = await Command.findOne({ deviceId })
      .sort({ createdAt: -1 });

    if (!last) return;

    await sendToDevice({
      deviceId,
      commandId: last.commandId,
      payload: last.payload
    });

  }

  else if (level === 2) {

    console.log("🔁 LEVEL 2 → controller restart");

    const controller =
      await ControllerInstance.findOne({ deviceId });

    if (controller) {
      controller.status = "offline";
      await controller.save();
    }

  }

  else if (level === 3) {

    console.log("🔁 LEVEL 3 → trigger failover");

    runtime.failoverRequired =
      runtime.failoverRequired || {};

    runtime.failoverRequired[deviceId] = true;

  }

  else if (level >= 4) {

    console.log("🚨 LEVEL 4 → device isolation");

    runtime.lockedDevices =
      runtime.lockedDevices || {};

    runtime.lockedDevices[deviceId] = {
      reason: "RECOVERY_FAILED",
      lockedAt: new Date()
    };

  }
}

function resetRecovery(deviceId) {

  delete recoveryAttempts[deviceId];

}

module.exports = {
  attemptRecovery,
  resetRecovery
};