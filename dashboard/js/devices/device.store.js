import { notifyUI } from "../store/store.notifier.js";

const devices = new Map();

export const deviceStore = {
  update(deviceId, state) {
    if (!deviceId) return;

    const prev = devices.get(deviceId) || {};

    const next = {
      deviceId,
      ...prev,
      ...state,
      lastSeen: Date.now(),
      status: "online"
    };

    devices.set(deviceId, next);
    notifyUI();
  },

  markOffline(deviceId) {
    const prev = devices.get(deviceId);
    if (!prev) return;

    devices.set(deviceId, {
      ...prev,
      status: "offline"
    });
    notifyUI();
  },

  get(deviceId) {
    return devices.get(deviceId);
  },

  getAll() {
    return Array.from(devices.values());
  }
};
