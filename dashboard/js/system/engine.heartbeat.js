// js/system/engine.heartbeat.js

const heartbeats = new Map();

/**
 * Register an engine for heartbeat tracking
 */
export function registerEngine(
  name,
  { interval = 5000, startFn = null } = {}
) {
  heartbeats.set(name, {
    lastBeat: Date.now(),
    interval,
    status: "alive",
    startFn,          // 🔥 CRITICAL
  });
}

/**
 * Mark engine as alive
 */
export function beat(name) {
  const hb = heartbeats.get(name);
  if (!hb) return;

  hb.lastBeat = Date.now();
  hb.status = "alive";
}

/**
 * Get single engine status
 */
export function getHeartbeatStatus(name) {
  return heartbeats.get(name);
}

/**
 * Get all engine statuses
 */
export function getAllHeartbeatStatus() {
  return Array.from(heartbeats.entries());
}
