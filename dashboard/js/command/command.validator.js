// command.validator.js

const ALLOWED_ACTIONS = ["ON", "OFF", "SET", "START", "STOP"];

export function validateCommand(cmd) {
  if (!cmd.id && !cmd.commandId)
  throw new Error("commandId missing");

  cmd.commandId = cmd.commandId || cmd.id;

  if (!cmd.commandId) throw new Error("commandId missing");

  if (!ALLOWED_ACTIONS.includes(cmd.action)) {
    throw new Error(`Invalid action: ${cmd.action}`);
  }

  if (typeof cmd.timestamp !== "number") {
    throw new Error("Invalid timestamp");
  }

  return true;
}
