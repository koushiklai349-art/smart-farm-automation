import { notifyUI } from "./store.notifier.js";
import { auditStore } from "../audit/audit.store.js";
import { metricsStore } from "../audit/metrics.store.js";

const COMMAND_TIMEOUT = 8000;

const commands = new Map();


export const commandStore = {
  add(cmd) {
    // metrics + audit
    metricsStore.inc("sent");
    auditStore.log({
      type: "COMMAND",
      commandId: cmd.commandId,
      deviceId: cmd.deviceId,
      action: cmd.action,
      source: cmd.source,
      status: "sent",
    });

    commands.set(cmd.commandId, cmd);
    notifyUI();

    // ⏱ timeout watcher
    setTimeout(() => {
      const current = commands.get(cmd.commandId);
      if (!current) return;

      if (current.status === "pending" || current.status === "sent") {
        Object.assign(current, {
          status: "failed",
          message: "Device not responding (timeout)",
        });

        metricsStore.inc("failed");
        metricsStore.inc("timeout");

        auditStore.log({
          type: "COMMAND",
          commandId: current.commandId,
          deviceId: current.deviceId,
          action: current.action,
          source: current.source,
          status: "failed",
          message: current.message,
        });

        notifyUI();
       
      }
    }, COMMAND_TIMEOUT);
  },

  update(id, patch) {
    const cmd = commands.get(id);
    if (!cmd) return;

    Object.assign(cmd, patch);

    // metrics
    if (patch.status === "SUCCESS") metricsStore.inc("success");
    if (patch.status === "failed") metricsStore.inc("failed");

    // audit
    auditStore.log({
      type: "COMMAND",
      commandId: cmd.commandId,
      deviceId: cmd.deviceId,
      action: cmd.action,
      source: cmd.source,
      status: patch.status,
      message: patch.message,
    });

    notifyUI();

  },

  getLastByDevice(deviceId) {
    let latest = null;
    for (const cmd of commands.values()) {
      if (cmd.deviceId === deviceId) {
        if (!latest || cmd.timestamp > latest.timestamp) {
          latest = cmd;
        }
      }
    }
    return latest;
  },
};
