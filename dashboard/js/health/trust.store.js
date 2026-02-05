// dashboard/js/health/trust.store.js

const trustMap = new Map();

// defaults
const DEFAULT_TRUST = 80;
const MIN_TRUST = 0;
const MAX_TRUST = 100;

export function getTrust(deviceId = "SYSTEM") {
  if (!trustMap.has(deviceId)) {
    trustMap.set(deviceId, {
      score: DEFAULT_TRUST,
      lastUpdatedAt: Date.now()
    });
  }
  return trustMap.get(deviceId);
}

export function setTrust(deviceId, score) {
  const bounded = Math.max(
    MIN_TRUST,
    Math.min(MAX_TRUST, score)
  );

  trustMap.set(deviceId, {
    score: bounded,
    lastUpdatedAt: Date.now()
  });
}

export function adjustTrust(deviceId, delta) {
  const current = getTrust(deviceId);
  setTrust(deviceId, current.score + delta);
}

export function getAllTrust() {
  return Array.from(trustMap.entries()).map(
    ([deviceId, data]) => ({
      deviceId,
      ...data
    })
  );
}
