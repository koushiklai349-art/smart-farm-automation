const failures = new Map(); 
// deviceId -> { count, lastAt }
// 🔒 TASK-66: failure decay config
const FAILURE_DECAY_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
const FAILURE_DECAY_STEP = 1;


export function recordFailure(deviceId) {
  const entry = failures.get(deviceId) || {
    count: 0,
    lastAt: Date.now()
  };

  entry.count += 1;
  entry.lastAt = Date.now();

  failures.set(deviceId, entry);
  return entry.count;
}


export function clearFailures(deviceId) {
  failures.delete(deviceId);
}

export function getFailures(deviceId) {
  return failures.get(deviceId)?.count || 0;
}

// 🔁 TASK-66: periodic failure decay
setInterval(() => {
  const now = Date.now();

  for (const [deviceId, entry] of failures.entries()) {
    if (now - entry.lastAt >= FAILURE_DECAY_INTERVAL_MS) {
      entry.count = Math.max(0, entry.count - FAILURE_DECAY_STEP);
      entry.lastAt = now;
     metricsStore.inc("failure_decay");

      // fully recovered → cleanup
      if (entry.count === 0) {
        failures.delete(deviceId);
      }
    }
  }
}, FAILURE_DECAY_INTERVAL_MS);
