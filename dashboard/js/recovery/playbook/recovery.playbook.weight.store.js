console.log("🔥 PLAYBOOK WEIGHT STORE LOADED");

import { isActionCurrentlySuppressed, unsuppressAction  } from "./recovery.playbook.outcome.store.js";
import { TRUST_SUPPRESS_THRESHOLD } from "./recovery.playbook.trust.js";
import { recordSuppression,recordUnsuppression } from "./recovery.playbook.suppression.store.js";

/**
 * Playbook action learning weights
 * action => score (0–100)
 */
const lastUsedAt = new Map();
const actionWeights = new Map();
const actionWeightHistory = new Map();

// baseline defaults
const DEFAULT_WEIGHT = 50;
const MIN_WEIGHT = 5;
const MAX_WEIGHT = 95;

function recordWeightHistory(action, weight, reason) {
  if (!action) return;

  if (!actionWeightHistory.has(action)) {
    actionWeightHistory.set(action, []);
  }

  actionWeightHistory.get(action).push({
    ts: Date.now(),
    weight,
    reason
  });

  // optional: last 30 points রাখবো
  const arr = actionWeightHistory.get(action);
  if (arr.length > 30) arr.shift();
}

/**
 * Get current weight for an action
 */
export function getActionWeight(action) {
  if (!action) return DEFAULT_WEIGHT;

  if (!actionWeights.has(action)) {
    actionWeights.set(action, DEFAULT_WEIGHT);
  }

  return actionWeights.get(action);
}

/**
 * Adjust weight based on lightweight outcome
 */
export function adjustActionWeight(action, outcomeStatus) {
  const current = getActionWeight(action);
  let delta = 0;

  switch (outcomeStatus) {
    case "SUCCESS":
      delta = +5;
      break;
    case "NO_EFFECT":
      delta = -3;
      break;
    case "FAILED":
      delta = -8;
      break;
    default:
      return;
  }

  const next = Math.min(
    MAX_WEIGHT,
    Math.max(MIN_WEIGHT, current + delta)
  );

  actionWeights.set(action, next);
  recordWeightHistory(action, next, outcomeStatus);


  console.info(
    `[PLAYBOOK-WEIGHT] ${action}: ${current} → ${next} (${outcomeStatus})`
  );
  maybeRecoverSuppressedAction(action);

  return next;
  
}

/**
 * Strong learning from resolved outcomes
 */
export function recordActionOutcome(action, status) {
  const current = getActionWeight(action);
  let delta = 0;

  if (status === "SUCCESS") delta = +10;
  else if (status === "FAILED") delta = -15;
  else if (status === "NO_EFFECT") delta = -5;
  else return current;

  let next = current + delta;

  if (next > MAX_WEIGHT) next = MAX_WEIGHT;
  if (next < MIN_WEIGHT) next = MIN_WEIGHT;

  actionWeights.set(action, next);
  recordWeightHistory(action, next, status);

  lastUsedAt.set(action, Date.now());
  return next;
}

/**
 * Debug / dashboard helper
 */
export function getAllActionWeights() {
  const obj = {};
  for (const [k, v] of actionWeights.entries()) {
    obj[k] = v;
  }
  return obj;
}

const DECAY_INTERVAL = 10 * 60 * 1000; // 10 minutes
const DECAY_AMOUNT = 2;

export function decayActionWeights() {
  const now = Date.now();

  for (const [action, weight] of actionWeights.entries()) {
    const last = lastUsedAt.get(action) || 0;

    if (now - last > DECAY_INTERVAL) {
      const next = Math.max(MIN_WEIGHT, weight - DECAY_AMOUNT);
      actionWeights.set(action, next);
      recordWeightHistory(action, next, "DECAY");
      console.info(
        `[PLAYBOOK-DECAY] ${action}: ${weight} → ${next}`
      );
    }
  }
}

export function maybeRecoverSuppressedAction(action) {
  const weight = getActionWeight(action);

  if (
    weight >= TRUST_SUPPRESS_THRESHOLD &&
    isActionCurrentlySuppressed(action)
  ) {
    recordWeightHistory(action, weight, "RECOVERED");

    unsuppressAction(action);

    recordUnsuppression(action, weight);

    console.info(
      "[Playbook] Action recovered from suppression:",
      action,
      weight
    );
  }
}

export function getActionWeightHistory(action) {
  return actionWeightHistory.get(action) || [];
}

// 🔥 DEBUG ONLY (remove later)
window.getActionWeightHistory = getActionWeightHistory;
