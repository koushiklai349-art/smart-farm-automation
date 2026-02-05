// dashboard/js/command/command.guard.js

import { hasActiveCommand } from "./command.store.js";
import { getSystemMode, SYSTEM_MODE } from "../recovery/recovery.state.js";

let locked = false;

export function lockCommands() {
  locked = true;
}

export function unlockCommands() {
  locked = false;
}

/**
 * Command execute করা যাবে কিনা (explainable)
 */
export function canExecuteCommand(command) {
  // 🔒 global lock
  if (locked) {
    return {
      allowed: false,
      reason: "COMMAND_LOCKED"
    };
  }

  // 🚨 System authority guard (TASK-103)
  const systemMode = getSystemMode();
  if (systemMode !== SYSTEM_MODE.STABLE) {
    return {
      allowed: false,
      reason: "SYSTEM_NOT_STABLE",
      meta: { systemMode }
    };
  }

  // 🔒 duplicate command guard
  if (command?.id && command?.deviceId) {
    if (hasActiveCommand(command.id, command.deviceId)) {
      return {
        allowed: false,
        reason: "DUPLICATE_COMMAND",
        meta: {
          commandId: command.id,
          deviceId: command.deviceId
        }
      };
    }
  }

  // ✅ allowed
  return {
    allowed: true
  };
}
