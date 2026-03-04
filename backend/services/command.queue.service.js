const { runtime } = require("../store/runtime.store");
const { saveRuntime } = require("../store/runtime.persistence");

function ensureQueue() {
  runtime.commandQueue = runtime.commandQueue || {};
}

function enqueueCommand(command) {
  ensureQueue();

  runtime.commandQueue[command.commandId] = {
    ...command,
    queuedAt: new Date().toISOString(),
    expiresAt: command.expiresAt || null,
    priority: command.priority || 0
  };

  saveRuntime();
  return runtime.commandQueue[command.commandId];
}

function removeCommand(commandId) {
  if (!runtime.commandQueue) return;
  delete runtime.commandQueue[commandId];
  saveRuntime();
}

function expireOldCommands() {
  ensureQueue();

  const now = new Date();

  Object.values(runtime.commandQueue).forEach(cmd => {
    if (cmd.expiresAt && new Date(cmd.expiresAt) < now) {
      console.log("⏳ Command expired:", cmd.commandId);
      delete runtime.commandQueue[cmd.commandId];
    }
  });

  saveRuntime();
}

function getQueuedCommands() {
  ensureQueue();

  return Object.values(runtime.commandQueue)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

module.exports = {
  enqueueCommand,
  removeCommand,
  getQueuedCommands,
  expireOldCommands
};