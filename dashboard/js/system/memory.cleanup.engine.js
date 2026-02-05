// dashboard/js/system/memory.cleanup.engine.js

import { cleanupOutcomes } from "../command/command.outcome.store.js";
import { cleanupActionStats } from "../learning/action.outcome.stats.js";

const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 min

let started = false;
let timerId = null;
let running = false;

export function startMemoryCleanupEngine() {
  if (started) return;

  started = true;

  timerId = setInterval(runCleanup, CLEANUP_INTERVAL);

  // 🔄 Run once on startup
  runCleanup();
}

function runCleanup() {
  if (running) return;
  running = true;

  try {
    const before = Date.now();

    cleanupOutcomes();
    cleanupActionStats();

    const duration = Date.now() - before;
    console.debug("[cleanup-engine] completed in", duration, "ms");
  } catch (e) {
    console.error("[cleanup-engine] error", e);
  } finally {
    running = false;
  }
}

// 🧪 Debug / recovery helper
export function forceCleanup() {
  runCleanup();
}

// 🛑 Optional stop (future use)
export function stopMemoryCleanupEngine() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
    started = false;
  }
}
