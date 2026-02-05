// command.dispatcher.js
import { canExecuteCommand } from "./command.guard.js";
import { validateCommand } from "./command.validator.js";
import { publishCommand } from "../mqtt/mqtt.publish.js";
import { addCommand,getCommand,updateCommand,incrementRetry,hasActiveCommand  } from "./command.store.js";
import { markCommandSent } from "./command.outcome.store.js";
import { logAutoActionAudit } from "../audit/auto.action.audit.js";
import { setManualOverride } from "../auto-action/manual.override.store.js";

export async function dispatchCommand(command) {
  console.log("🚀 Dispatching command:", command);

  if (hasActiveCommand(command.id, command.deviceId)) {
    return;
  }

  const guardResult = canExecuteCommand(command);

  if (!guardResult.allowed) {
    addCommand({
      ...command,
      status: "BLOCKED",
      blockedReason: guardResult.reason,
      blockedMeta: guardResult.meta || null,
      blockedAt: Date.now()
    });

    logAutoActionAudit({
      deviceId: command.deviceId,
      stage: "ACTION_BLOCKED",
      action: command.action,
      reason: guardResult.reason,
      guardResult,
      context: null,
      ruleExplain: command.explain || null
    });
    return;
  }

  // normalize command id
  command.commandId = command.commandId || command.id;

  validateCommand(command);

  if (command.source === "manual") {
  setManualOverride(command.deviceId, command.target);
  }

  addCommand(command);

  try {
    await Promise.resolve(publishCommand(command));

    markCommandSent(command.id, {
      deviceId: command.deviceId,
      action: command.action,
      source: command.source
    });

    updateCommand(command.id, { status: "SENT" });

    logAutoActionAudit({
      deviceId: command.deviceId,
      stage: "ACTION_ALLOWED",
      action: command.action,
      reason: "COMMAND_DISPATCHED",
      guardResult,
      context: null,
      ruleExplain: command.explain || null
    });
  } catch (err) {
    console.error("Command dispatch failed:", command.id, err);

    updateCommand(command.id, {
      status: "FAILED",
      error: err.message || "publish_failed"
    });

    throw err;
  }

  // ⏱️ timeout watcher
  setTimeout(() => {
    const current = getCommand(command.id);
    if (!current) return;

    if (current.status === "SENT") {
      updateCommand(command.id, { status: "TIMEOUT" });
      retryIfPossible(current);
    }
  }, 5000);
}

function retryIfPossible(command) {
  if (command.retryCount >= 2) return;

  incrementRetry(command.id);

  console.warn(
    `🔁 Retrying command ${command.id} (${command.retryCount + 1})`
  );

  publishCommand({
    ...command,
    timestamp: Date.now()
  });
}
