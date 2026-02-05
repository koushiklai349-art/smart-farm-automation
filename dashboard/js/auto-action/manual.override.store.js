// manual.override.store.js
const overrides = new Map();
// key = deviceId:target → expiresAt

const OVERRIDE_TTL_MS = 5 * 60 * 1000; // 5 min

export function setManualOverride(deviceId, target) {
  overrides.set(
    `${deviceId}:${target}`,
    Date.now() + OVERRIDE_TTL_MS
  );
}

export function hasManualOverride(deviceId, target) {
  const key = `${deviceId}:${target}`;
  const exp = overrides.get(key);
  if (!exp) return false;

  if (Date.now() > exp) {
    overrides.delete(key);
    return false;
  }
  return true;
}
