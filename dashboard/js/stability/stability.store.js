// js/stability/stability.store.js

const _stabilityMap = new Map();

export function getStability(deviceId) {
  return _stabilityMap.get(deviceId);
}

export function saveStability(deviceId, data) {
  _stabilityMap.set(deviceId, data);
}

export function getAllStabilities() {
  return Array.from(_stabilityMap.entries());
}
