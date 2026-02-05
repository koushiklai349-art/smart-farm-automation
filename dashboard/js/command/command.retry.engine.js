// src/commands/command.retry.engine.js

import { canExecuteCommand } from "./command.guard.js";
import { auditStore } from "../audit/audit.store.js";
import { metricsStore } from "../audit/metrics.store.js";
import { getAllCommands,updateCommand,incrementRetry,removeCommand } from "./command.store.js";
import { sendCommand } from "./command.sender.js";
import { markCommandNoEffect } from "./command.outcome.store.js";
import { applyHealthSignal } from "../health/system.health.js";
import { getDeviceConfidence } from "../devices/device.manager.js";
import { getActionWeight } from "../recovery/playbook/recovery.playbook.weight.store.js";
import { getActionRisk } from "../learning/action.risk.engine.js";

const COMMAND_TIMEOUT = 8000;
const MAX_RETRY = 3;

const BASE_RETRY_DELAY = 2000; // 2s
const MAX_RETRY_DELAY = 30000; // 30s

// 🛑 TASK-50: single-instance guard
let retryEngineStarted = false;
let retryIntervalId = null;

/**
 * Start retry engine loop
 * @param {object} mqttClient
 */
export function startRetryEngine(mqttClient) {
  if (!canExecuteCommand()) return;

  // 🛑 prevent duplicate interval
  if (retryEngineStarted) return;
  retryEngineStarted = true;

  if (retryIntervalId) {
    clearInterval(retryIntervalId);
    retryIntervalId = null;
  }

  retryIntervalId = setInterval(() => {
    const now = Date.now();
    const commands = getAllCommands();

    commands.forEach((cmd) => {
      if (cmd.acked === true) return;      // 🔒 FIRST
      if (cmd.status !== "sent") return;
      if (!cmd.sentAt) return;

      const expired = now - cmd.sentAt > COMMAND_TIMEOUT;
      if (!expired) return;

      const retryCount = Number(cmd.retryCount || 0);

      // 🔁 retry allowed
      if (retryCount < MAX_RETRY) {

        // 🔒 Phase-2.3: Device confidence guard
        const confidence = getDeviceConfidence(cmd.deviceId);
        if (confidence?.level === "LOW") {
          updateCommand(cmd.id, {
            status: "failed",
            lastError: "Retry blocked: low device confidence",
            completedAt: Date.now(),
            acked: true
          });

          auditStore.add({
            type: "command_retry_blocked",
            refId: cmd.id,
            meta: { deviceId: cmd.deviceId }
          });

          metricsStore.increment("commands_failed");
          return;
        }
       // 🔮 Phase-10.4: predictive action risk guard
const risk = getActionRisk(cmd.deviceId, cmd.action);

if (risk?.level === "HIGH") {
  updateCommand(cmd.id, {
    status: "failed",
    lastError: "Retry blocked: high action risk",
    completedAt: Date.now(),
    acked: true
  });

  auditStore.add({
    type: "command_retry_blocked_risk",
    refId: cmd.id,
    meta: {
      deviceId: cmd.deviceId,
      action: cmd.action,
      risk: risk.level,
      score: risk.score,
      reason: risk.reason
    }
  });

  metricsStore.increment("commands_failed");
  applyHealthSignal("command_failed");
  return;
}

        incrementRetry(cmd.id);

        updateCommand(cmd.id, {
          status: "pending",
          sentAt: null,
          lastError: "ACK timeout, retrying"
        });

        auditStore.add({
          type: "command_retry",
          refId: cmd.id,
          meta: { retryCount: retryCount + 1 }
        });

        metricsStore.increment("commands_retry");
        applyHealthSignal("command_retry");

        const delay = computeRetryDelay(cmd.action);
        
        auditStore.add({
        type: "command_retry_scheduled",
        refId: cmd.id,
        meta: {
        action: cmd.action,
        retryCount: retryCount + 1,
        delay
        }
        });

        setTimeout(() => {
          sendCommand(mqttClient, cmd);
        }, delay);

        return;
      }

      // ❌ max retry exceeded
      updateCommand(cmd.id, {
        status: "failed",
        lastError: "Max retry exceeded",
        completedAt: now,
        acked: true
      });

      // 🧠 timeout outcome
      markCommandNoEffect(cmd.id);

      auditStore.add({
        type: "command_failed",
        refId: cmd.id,
        meta: {
          deviceId: cmd.deviceId,
          error: "Max retry exceeded"
        }
      });

      metricsStore.increment("commands_failed");
      removeCommand(cmd.id);
    });
  }, 1000);
}

export function computeRetryDelay(action) {
  const weight = getActionWeight(action); // trust proxy

  // lower weight → higher delay
  const riskMultiplier =
    weight >= 80 ? 1 :
    weight >= 60 ? 1.5 :
    weight >= 40 ? 2 :
    weight >= 20 ? 3 : 5;

  const delay = BASE_RETRY_DELAY * riskMultiplier;

  return Math.min(delay, MAX_RETRY_DELAY);
}