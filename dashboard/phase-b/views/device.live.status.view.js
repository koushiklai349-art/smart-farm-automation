import { getDeviceStatus } from "../store/device.runtime.store.js";

export function renderDeviceLiveStatus(deviceId) {
  const state = getDeviceStatus(deviceId);

  if (!state) return "Device offline";

  return `Status: ${state.status} (updated ${state.updatedAt})`;
}
