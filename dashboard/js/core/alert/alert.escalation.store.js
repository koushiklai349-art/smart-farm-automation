// core/alert/alert.escalation.store.js

const escalationMap = new Map();

/*
Key: alertCode|deviceId
Value shape:
{
  code,
  deviceId,
  firstSeenAt,
  lastSeenAt,
  count,
  lastSeverity
}
*/

function buildKey(code, deviceId) {
  return `${code}|${deviceId || "SYSTEM"}`;
}

export function recordAlert(alert, context = {}) {
  const now = Date.now();
  const key = buildKey(alert.code, context.deviceId);

  const existing = escalationMap.get(key);

  if (!existing) {
    escalationMap.set(key, {
      code: alert.code,
      deviceId: context.deviceId || null,
      firstSeenAt: now,
      lastSeenAt: now,
      count: 1,
      lastSeverity: alert.severity
    });
    return escalationMap.get(key);
  }

  existing.count += 1;
  existing.lastSeenAt = now;
  existing.lastSeverity = alert.severity;

  return existing;
}

export function getEscalationState(code, deviceId) {
  return escalationMap.get(buildKey(code, deviceId));
}

export function resetEscalation(code, deviceId) {
  escalationMap.delete(buildKey(code, deviceId));
}

// 🧹 optional cleanup (safety)
const MAX_ESCALATION_AGE_MS = 60 * 60 * 1000; // 1 hour

export function cleanupEscalations() {
  const now = Date.now();
  escalationMap.forEach((state, key) => {
    if (now - state.lastSeenAt > MAX_ESCALATION_AGE_MS) {
      escalationMap.delete(key);
    }
  });
}
