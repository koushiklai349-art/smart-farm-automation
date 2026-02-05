const GROUP_WINDOW_MS = 60 * 1000; // 1 min

const groups = new Map();

/**
 * Build grouping key
 */
function buildKey(alert, meta) {
  return [
    alert.code,
    meta?.deviceId || "SYSTEM"
  ].join("|");
}

export function groupAlert(alert, meta = {}) {
  const now = Date.now();
  const key = buildKey(alert, meta);

  const existing = groups.get(key);

  if (
    existing &&
    now - existing.lastAt < GROUP_WINDOW_MS
  ) {
    existing.count += 1;
    existing.lastAt = now;
    existing.metaSamples.push(meta);
    return {
      grouped: true,
      alert: existing
    };
  }

  const groupedAlert = {
    ...alert,
    key,
    firstAt: now,
    lastAt: now,
    count: 1,
    metaSamples: [meta]
  };

  groups.set(key, groupedAlert);

  return {
    grouped: false,
    alert: groupedAlert
  };
}

export function getAlertGroups() {
  return Array.from(groups.values());
}

// 🧹 Step-C: cleanup old alert groups (lifecycle safety)
const GROUP_MAX_AGE_MS = 10 * 60 * 1000; // 10 min

export function cleanupAlertGroups() {
  const now = Date.now();

  groups.forEach((group, key) => {
    if (now - group.lastAt > GROUP_MAX_AGE_MS) {
      groups.delete(key);
    }
  });
}
