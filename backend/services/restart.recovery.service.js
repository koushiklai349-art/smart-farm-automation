const Command = require("../models/command.model");
const { processCommand } = require("./command.orchestrator.service");
const { sendToDevice } = require("../phase-b/integration/device.bridge");
const { runtime } = require("../store/runtime.store");

async function recoverCommandsOnStartup() {

  console.log("♻️ Running restart command recovery...");
  runtime.activeCommands = {};

  const incompleteCommands = await Command.find({
    status: { $in: ["pending", "allowed", "retrying", "sent"] }
  });

 for (const command of incompleteCommands) {

  console.log(
    `🔄 Recovering command ${command.commandId} (${command.status})`
  );

  // 🔒 Rebuild active lock
  runtime.activeCommands[command.deviceId] = {
    commandId: command.commandId,
    source: command.source,
    startedAt: command.updatedAt?.getTime() || Date.now()
  };

  if (command.status === "pending") {
    await processCommand({
      deviceId: command.deviceId,
      commandId: command.commandId,
      payload: command.payload,
      source: command.source
    });
  }

  else if (["allowed", "retrying", "sent"].includes(command.status)) {

    await sendToDevice({
      deviceId: command.deviceId,
      commandId: command.commandId,
      payload: command.payload
    });

    command.status = "sent";
    await command.save();
  }
}

  console.log("✅ Restart recovery completed.");
}

module.exports = {
  recoverCommandsOnStartup
};