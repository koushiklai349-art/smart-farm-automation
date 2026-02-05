// js/command/command.store.js

const commandStore = new Map();
const activeCommandIndex = new Set();

const MAX_COMMAND_AGE_MS = 5 * 60 * 1000;

// 🔒 Phase-2.2: official lifecycle
const FINAL_STATES = new Set(["SUCCESS", "FAILED", "TIMEOUT"]);

function isFinal(status) {
  return FINAL_STATES.has(status);
}

/**
 * Add new command
 */
export function addCommand(command) {
  const now = Date.now();

  const cmd = {
    ...command,
    status: "CREATED",
    createdAt: now,
    retryCount: 0
  };

  commandStore.set(cmd.id, cmd);
  activeCommandIndex.add(`${cmd.id}:${cmd.deviceId}`);

  return cmd;
}

/**
 * Get command
 */
export function getCommand(commandId) {
  return commandStore.get(commandId);
}

/**
 * Safe state transition
 */
export function updateCommand(commandId, next = {}) {
  const cmd = getCommand(commandId);
  if (!cmd) return null;

  // 🚫 block mutation after final
  if (isFinal(cmd.status)) return cmd;

  const now = Date.now();

  if (next.status && next.status !== cmd.status) {
    cmd.status = next.status;

    if (next.status === "SENT") cmd.sentAt = now;
    if (next.status === "ACK") cmd.ackAt = now;
    if (next.status === "RUNNING") cmd.runningAt = now;

    if (isFinal(next.status)) {
      cmd.completedAt = now;
      activeCommandIndex.delete(`${cmd.id}:${cmd.deviceId}`);
    }
  }

  Object.assign(cmd, next);
  return cmd;
}

/**
 * Retry counter
 */
export function incrementRetry(commandId) {
  const cmd = getCommand(commandId);
  if (!cmd || isFinal(cmd.status)) return cmd;

  cmd.retryCount += 1;
  return cmd;
}

/**
 * Check active command
 */
export function hasActiveCommand(commandId, deviceId) {
  return activeCommandIndex.has(`${commandId}:${deviceId}`);
}

/**
 * Remove command (manual / cleanup)
 */
export function removeCommand(commandId) {
  const cmd = getCommand(commandId);

  if (cmd?.deviceId) {
    activeCommandIndex.delete(`${commandId}:${cmd.deviceId}`);
  }

  return commandStore.delete(commandId);
}

/**
 * All commands (UI / debug)
 */
export function getAllCommands() {
  return Array.from(commandStore.values());
}

/**
 * ⏱️ Cleanup stale non-final commands
 */
function cleanupStaleCommands() {
  const now = Date.now();

  for (const [id, cmd] of commandStore.entries()) {
    const age = now - (cmd.sentAt || cmd.createdAt);

    if (age > MAX_COMMAND_AGE_MS && !isFinal(cmd.status)) {
      cmd.status = "TIMEOUT";
      cmd.completedAt = now;
      activeCommandIndex.delete(`${cmd.id}:${cmd.deviceId}`);
    }
  }
}

// periodic cleanup
setInterval(cleanupStaleCommands, 60_000);
