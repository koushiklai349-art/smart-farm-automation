// dashboard/js/core/alert/alert.throttle.js

const throttleMap = new Map();

/**
 * Check if alert can be sent
 * @param {string} key unique alert key
 * @param {number} cooldown ms
 */
export function canSendAlert(key, cooldown = 5 * 60 * 1000) {
  const now = Date.now();
  const entry = throttleMap.get(key);

  // 🟢 First time
  if (!entry) {
    throttleMap.set(key, {
      lastSent: now,
      cooldown
    });
    return true;
  }

  // 🕒 Cooldown passed
  if (now - entry.lastSent >= entry.cooldown) {
    entry.lastSent = now;
    return true;
  }

  // 🚫 Throttled
  return false;
}

/**
 * Cleanup old throttle entries
 */
export function cleanupThrottle() {
  const now = Date.now();

  throttleMap.forEach((entry, key) => {
    // no activity for 2x cooldown
    if (now - entry.lastSent > entry.cooldown * 2) {
      throttleMap.delete(key);
    }
  });
}

/**
 * Debug helpers
 */
export function resetThrottle(key) {
  throttleMap.delete(key);
}

export function getThrottleSize() {
  return throttleMap.size;
}
