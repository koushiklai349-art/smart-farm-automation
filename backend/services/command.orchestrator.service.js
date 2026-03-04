const { runtime } = require("../store/runtime.store");
const { sendToDevice } = require("../phase-b/integration/device.bridge");
const Command = require("../models/Command.model");
const ControllerInstance = require("../models/controllerinstance.model");
const { getRollbackCommand } = require("./rollback.policy");
const alertService = require("./alert.service");
const { isMaintenanceActive } = require("./maintenance.service");
const { resolveActiveController } = require("./failover.service");
const { evaluateEnergy } = require("./energy.optimizer.service");
const globalAI = require("./global.ai.service");

const PRIORITY = {
  EMERGENCY: 4,
  MANUAL: 3,
  SCHEDULE: 2,
  AI: 1,
  SYSTEM: 0
};

const COMMAND_TIMEOUT_MS = 15000;

function releaseActive(deviceId) {
  if (runtime.activeCommands) {
    delete runtime.activeCommands[deviceId];
  }
}

async function markFailed(commandId, reason) {
 const cmd = await Command.findOneAndUpdate(
  { commandId },
  {
    status: "failed",
    failureReason: reason
  },
  { new: true }
);

if (cmd) {
  const controller = await ControllerInstance.findOne({ deviceId: cmd.deviceId });
  if (controller) {
    controller.healthScore -= 10;
    if (controller.healthScore < 0) controller.healthScore = 0;
    await controller.save();
  }
}

await alertService.createAlert({
  type: "COMMAND_FAILURE",
  deviceId: cmd.deviceId,
  severity: "medium",
  message: `Command ${cmd.commandId} failed`
});
}

async function retryCommand(command) {
  const fresh = await Command.findOne({ commandId: command.commandId });
  if (!fresh) return;

  if (fresh.retryCount >= fresh.maxRetries) {
    await markFailed(command.commandId, "MAX_RETRIES_EXCEEDED");
    return;
  }

  await Command.findOneAndUpdate(
    { commandId: command.commandId },
    {
      $inc: { retryCount: 1 },
      status: "retrying"
    }
  );

  const delay = Math.pow(2, fresh.retryCount) * 1000;

  setTimeout(async () => {
    await sendToDevice(fresh);
  }, delay);
}

async function processCommand(command) {

if (runtime.lockedDevices?.[command.deviceId]) {

  await Command.findOneAndUpdate(
    { commandId: command.commandId },
    {
      status: "blocked",
      failureReason: "DEVICE_LOCKED"
    }
  );

  return { status: "BLOCKED_DEVICE_LOCKED" };
}
  // 🔒 Maintenance Freeze (Manual allowed)
if (isMaintenanceActive() && command.source !== "MANUAL") {
  await Command.findOneAndUpdate(
    { commandId: command.commandId },
    {
      status: "blocked",
      failureReason: "MAINTENANCE_MODE_ACTIVE"
    }
  );

  return { status: "BLOCKED_MAINTENANCE" };
}
const activeDeviceId = await resolveActiveController(command.deviceId);

if (!activeDeviceId) {
  return { status: "NO_ACTIVE_CONTROLLER" };
}

command.deviceId = activeDeviceId;
  // 🔥 1️⃣ Controller Online Validation
  const controller = await ControllerInstance.findOne({
    deviceId: command.deviceId
  });

  if (!controller || controller.status !== "online") {
    await Command.findOneAndUpdate(
      { commandId: command.commandId },
      {
        status: "blocked",
        failureReason: "CONTROLLER_OFFLINE"
      }
    );
    return { status: "BLOCKED_CONTROLLER_OFFLINE" };
  }

  const source = command.source || "SYSTEM";
  const priority = PRIORITY[source] ?? 0;

  runtime.activeCommands = runtime.activeCommands || {};
  const current = runtime.activeCommands[command.deviceId];

  // 🔥 2️⃣ Higher priority protection
  if (current && current.priority > priority) {
    await Command.findOneAndUpdate(
      { commandId: command.commandId },
      {
        status: "blocked",
        failureReason: "BLOCKED_BY_HIGHER_PRIORITY"
      }
    );
    return { status: "BLOCKED_BY_HIGHER_PRIORITY" };
  }

  // 🔥 3️⃣ Same priority → latest wins (NEW SAFE ADDITION)
  if (current && current.priority === priority) {
    console.log("♻️ Same priority detected → Replacing active command");
    releaseActive(command.deviceId);
  }

  runtime.activeCommands[command.deviceId] = {
    priority,
    source,
    commandId: command.commandId,
    startedAt: Date.now()
  };
const energyDecision = evaluateEnergy(command.deviceId);

if (energyDecision.action === "DELAY_NON_CRITICAL") {

  if (command.source !== "EMERGENCY") {

    console.log(
      "⚡ Energy optimization delaying command"
    );

    return { status: "DELAYED_ENERGY_OPTIMIZATION" };
  }
}

if (energyDecision.action === "ENERGY_CRITICAL") {

  console.log("⚠️ Energy critical — blocking command");

  return { status: "BLOCKED_ENERGY_LIMIT" };
}
  // 🔥 4️⃣ Timeout Guard
  setTimeout(async () => {
    const active = runtime.activeCommands?.[command.deviceId];

    if (active && active.commandId === command.commandId) {
      console.log("⚠️ Command timeout → marking failed");

      await markFailed(command.commandId, "TIMEOUT");
      
      globalAI.recordLearning(
       command.deviceId,
       "COMMAND_EXECUTION",
      false
     );
      // 🔁 Rollback
      const rollbackCmd = getRollbackCommand(command);

      if (rollbackCmd) {
        console.log("🔁 Triggering rollback...");
        await sendToDevice({
          ...rollbackCmd,
          commandId: "rollback-" + Date.now()
        });
      }

      await retryCommand(command);

      releaseActive(command.deviceId);
    }
  }, COMMAND_TIMEOUT_MS);

  return { status: "ALLOWED" };
}

module.exports = {
  processCommand,
  releaseActive
};
function cleanStaleActiveLocks(timeoutMs = 30000) {
  const now = Date.now();

  Object.keys(runtime.activeCommands || {}).forEach(deviceId => {
    const active = runtime.activeCommands[deviceId];

    if (!active) return;

    if (now - active.startedAt > timeoutMs) {
      console.log(
        `🧹 Cleaning stale active lock for ${deviceId}`
      );
      delete runtime.activeCommands[deviceId];
    }
  });
}

module.exports.cleanStaleActiveLocks = cleanStaleActiveLocks;