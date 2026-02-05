// dashboard/js/command/command.outcome.store.js
import { recordActionOutcome } from "../learning/action.outcome.stats.js";

const outcomeStore = new Map();

/**
 * Command পাঠানো হয়েছে
 */
export function markCommandSent(commandId, meta = {}) {
  outcomeStore.set(commandId, {
    status: "PENDING",
    meta,
    timestamp: Date.now()
  });
}

/**
 * Device থেকে success feedback
 */
export function markCommandSuccess(commandId, feedback) {
  update(commandId, "SUCCESS", feedback);
}

/**
 * Device থেকে failure feedback
 */
export function markCommandFailure(commandId, feedback) {
  update(commandId, "FAILURE", feedback);
}

/**
 * Timeout / no feedback
 */
export function markCommandNoEffect(commandId) {
  update(commandId, "NO_EFFECT");
}

/* ---------- helpers ---------- */

function update(commandId, status, feedback) {
  if (!outcomeStore.has(commandId)) return;

  const entry = outcomeStore.get(commandId);
  entry.status = status;
  entry.feedback = feedback;
  entry.completedAt = Date.now();
  
   recordActionOutcome({
    deviceId: entry.meta?.deviceId,
    action: entry.meta?.action,
    outcome: status
  });
}

export function cleanupOutcomes() {
  const now = Date.now();

  outcomeStore.forEach((entry, commandId) => {
    // completed & older than 1 hour
    if (
      entry.completedAt &&
      now - entry.completedAt > 60 * 60 * 1000
    ) {
      outcomeStore.delete(commandId);
    }
  });
}
export function hasOutcome(commandId) {
  return outcomeStore.has(commandId);
}
