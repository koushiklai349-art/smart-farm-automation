// js/command/command.ack.listener.js

import { getCommand, updateCommand } from "./command.store.js";
import { auditStore } from "../audit/audit.store.js";
import { metricsStore } from "../audit/metrics.store.js";
import { markCommandSuccess,markCommandFailure } from "./command.outcome.store.js";
import { applyHealthSignal } from "../health/system.health.js";
import { resolvePlaybookOutcome,recordPlaybookAction } from "../recovery/playbook/recovery.playbook.outcome.store.js";
import { deviceStore } from "../devices/device.store.js";

const ALLOWED_ACK = ["SUCCESS", "FAILED", "NO_EFFECT"];

export function initAckListener(mqttClient) {
 mqttClient.subscribe("smartfarm/+/ack", { qos: 1 });

  mqttClient.on("message", (topic, message) => {
    if (!topic.endsWith("/ack")) return;

    let data;
    try {
      data = JSON.parse(message.toString());
    } catch {
      return;
    }

    const { cmdId, status, meta } = data;
    if (!cmdId || !ALLOWED_ACK.includes(status)) return;

    const command = getCommand(cmdId);
    if (!command) return;

    // 🔒 Only SENT commands can receive ACK
    if (command.status !== "SENT") return;

    // 1️⃣ ACK stage
    updateCommand(cmdId, { status: "ACK" });

    // ===============================
    // ✅ SUCCESS
    // ===============================
    if (status === "SUCCESS") {
      updateCommand(cmdId, { status: "SUCCESS" });

      markCommandSuccess(cmdId, { deviceId: command.deviceId });
      deviceStore.update(command.deviceId, {
      actuators: {
      ...(deviceStore.get(command.deviceId)?.actuators || {}),
      [command.target]: command.action
      }
      });

      applyHealthSignal("command_success");

      auditStore.add({
        type: "command_success",
        refId: cmdId,
        meta: { deviceId: command.deviceId }
      });

      metricsStore.increment("commands_success");

      recordPlaybookAction({
        action: "RETRY_DEVICE",
        deviceId: command.deviceId,
        explain: { source: "COMMAND_ACK", status: "SUCCESS" }
      });

      resolvePlaybookOutcome({
        action: "RETRY_DEVICE",
        deviceId: command.deviceId,
        status: "SUCCESS",
        meta: { source: "COMMAND_ACK" }
      });
    }

    // ===============================
    // 🟡 NO EFFECT → semantic failure
    // ===============================
    else if (status === "NO_EFFECT") {
      updateCommand(cmdId, { status: "FAILED" });

      markCommandFailure(cmdId, {
        deviceId: command.deviceId,
        noEffect: true
      });

      auditStore.add({
        type: "command_no_effect",
        refId: cmdId,
        meta: { deviceId: command.deviceId }
      });

      metricsStore.increment("commands_no_effect");

      resolvePlaybookOutcome({
        action: "RETRY_DEVICE",
        deviceId: command.deviceId,
        status: "NO_EFFECT",
        meta: { source: "COMMAND_ACK" }
      });
    }

    // ===============================
    // 🔴 FAILED
    // ===============================
    else if (status === "FAILED") {
      updateCommand(cmdId, {
        status: "FAILED",
        lastError: meta?.error || "Device failure"
      });

      markCommandFailure(cmdId, {
        deviceId: command.deviceId,
        error: meta?.error
      });

      applyHealthSignal("command_failed");

      auditStore.add({
        type: "command_failed",
        refId: cmdId,
        meta: {
          deviceId: command.deviceId,
          error: meta?.error
        }
      });

      metricsStore.increment("commands_failed");

      resolvePlaybookOutcome({
        action: "RETRY_DEVICE",
        deviceId: command.deviceId,
        status: "FAILED",
        meta: { error: meta?.error }
      });
    }
  });
}
