import { auditStore } from "../audit/audit.store.js";
import { metricsStore } from "../audit/metrics.store.js";
import { applyHealthSignal } from "../health/system.health.js";

// 🔒 TASK-57: cooldown after flood
const COOLDOWN_MS = 10_000; // 10 sec
const cooldownUntil = new Map(); // deviceId -> timestamp

// Simple token-bucket style limiter
let enabled = true; 
const deviceBuckets = new Map();
const CLEANUP_INTERVAL_MS = 60_000; // 1 min
// config (tune later)
const MAX_PER_WINDOW = 5;      // max commands
const WINDOW_MS = 3000;        // per 3 seconds

export function allowCommand(cmd) {
  if (!enabled) return false;
  if (!cmd || !cmd.deviceId) return true;

  const now = Date.now();
  // 🔒 cooldown guard
  const until = cooldownUntil.get(cmd.deviceId);
  if (until && now < until) {
    return false;
  }
  let bucket = deviceBuckets.get(cmd.deviceId);

  if (!bucket) {
    bucket = { count: 0, windowStart: now };
    deviceBuckets.set(cmd.deviceId, bucket);
  }

  // reset window
  if (now - bucket.windowStart > WINDOW_MS) {
    bucket.count = 0;
    bucket.windowStart = now;
  }
  if (!cmd.isRetry) {
  bucket.count++;
}

const allowed = bucket.count <= MAX_PER_WINDOW;
if (!allowed) {
  // 🔔 TASK-57: flood visibility
  metricsStore.increment("commands_rate_limited");
  auditStore.add({
    type: "command_rate_limited",
    refId: cmd.id,
    meta: {
      deviceId: cmd.deviceId,
      windowMs: WINDOW_MS,
      max: MAX_PER_WINDOW
    }
  });
  
  // ❤️ TASK-58: health signal
  applyHealthSignal("command_rate_limited");

  // 🔒 TASK-57: set cooldown
  cooldownUntil.set(cmd.deviceId, now + COOLDOWN_MS);
}
return allowed;

}

export function resetLimiter(deviceId) {
  if (deviceId) deviceBuckets.delete(deviceId);
  else deviceBuckets.clear();
}
// 🔒 periodic cleanup (single instance)
setInterval(() => {
  const now = Date.now();
  for (const [deviceId, bucket] of deviceBuckets.entries()) {
    if (now - bucket.windowStart > WINDOW_MS * 2) {
      deviceBuckets.delete(deviceId);
    }
  }
  // cleanup cooldown map
for (const [deviceId, until] of cooldownUntil.entries()) {
  if (until <= now) cooldownUntil.delete(deviceId);
}
}, CLEANUP_INTERVAL_MS);

// ✅ alias export for auto-action guard compatibility
export const commandRateLimiter = {
  allow: allowCommand,
  reset: resetLimiter
};
