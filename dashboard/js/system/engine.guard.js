import { getSystemHealthScore } from "../health/system.health.js";
import { getBootstrapStatus } from "./system.bootstrap.js";
import { metricsStore } from "../audit/metrics.store.js";

// 🔒 Phase-13.6-A: Dry-run mode
let dryRunEnabled = false;

const running = new Set();

export function runOnce(key, fn) {
  if (running.has(key)) {
    console.warn("Engine already running:", key);
    return;
  }

  running.add(key);

  try {
    return Promise.resolve(fn());
  } catch (err) {
    console.error("Engine error:", key, err);
    throw err;
  } finally {
    running.delete(key);
  }
}

// 🔧 Emergency unlock (debug / recovery use)
export function forceRelease(key) {
  if (running.has(key)) {
    console.warn("Force releasing engine lock:", key);
    running.delete(key);
  }
}

// 🔍 Optional: check state
export function isRunning(key) {
  return running.has(key);
}

/**
 * Enable / disable dry-run mode
 */
export function setDryRunMode(enabled = true) {
  dryRunEnabled = Boolean(enabled);
  console.warn("[ENGINE] Dry-run mode:", dryRunEnabled ? "ON" : "OFF");
}

/**
 * Check if dry-run is active
 */
export function isDryRunMode() {
  return dryRunEnabled === true;
}

// 🔒 TASK-64: auto throttle based on system health
export function canExecuteCommand() {
  const health = getSystemHealthScore();

  // very bad health → block commands
  if (health <= 30) {
    console.warn("[ENGINE] Command blocked due to low health:", health);
    metricsStore.inc("health_throttle");
    return false;
  }

  // dry-run mode still allows evaluation
  if (dryRunEnabled) {
    return true;
  }

  return true;
}


export function assertSystemReady({ allowBooting = false } = {}) {
  const status = getBootstrapStatus();

  if (status.status === "ready") return true;
  if (allowBooting && status.status === "booting") return true;

  throw new Error("System not ready yet");
}
// ✅ alias export for auto-action guard compatibility
export function isEngineLocked(key) {
  return isRunning(key);
}
