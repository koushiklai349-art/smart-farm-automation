
// src/command/command.model.js
import { auditStore } from "../audit/audit.store.js";
import { metricsStore } from "../audit/metrics.store.js";

export function createCommand({ deviceId, action, payload = {}, source = "ui" }) {
  const now = Date.now();

  const command = {
    id: crypto.randomUUID(),
    deviceId,
    action,
    payload,
    source,

    status: "pending",
    retryCount: 0,

    createdAt: now,
    sentAt: null,
    completedAt: null,

    timeoutMs: 8000,
    lastError: null
  };

  auditStore.add({
    type: "command_created",
    refId: command.id,
    meta: { deviceId, action, source }
  });

  metricsStore.increment("commands_total");

  return command;
}
