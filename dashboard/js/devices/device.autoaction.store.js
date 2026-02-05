// dashboard/js/devices/device.autoaction.store.js

const autoActionState = new Map();

/**
 * ডিভাইসের auto action enable করা
 */
export function enableAutoAction(deviceId) {
  autoActionState.set(deviceId, true);
}

/**
 * ডিভাইসের auto action disable করা
 */
export function disableAutoAction(deviceId) {
  autoActionState.set(deviceId, false);
}

/**
 * ডিভাইসে auto action চালু আছে কিনা
 */
export function isAutoActionEnabled(deviceId) {
  // default = enabled
  if (!autoActionState.has(deviceId)) return true;
  return autoActionState.get(deviceId) === true;
}
