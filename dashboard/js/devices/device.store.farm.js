import { notifyUI } from "../store/store.notifier.js";
import { farmContext } from "../farm/farm.context.store.js";

const devicesByFarm = new Map(); // farmId -> Map(deviceId -> device)

function ensureFarmMap() {
  const farmId = farmContext.get();
  if (!farmId) return null;

  if (!devicesByFarm.has(farmId)) {
    devicesByFarm.set(farmId, new Map());
  }
  return devicesByFarm.get(farmId);
}

export const deviceStore = {
  update(deviceId, state) {
    const farmMap = ensureFarmMap();
    if (!farmMap || !deviceId) return;

    const prev = farmMap.get(deviceId) || {};
    const next = {
      deviceId,
      ...prev,
      ...state,
      lastSeen: Date.now(),
      status: "online"
    };

    farmMap.set(deviceId, next);
    notifyUI();
  },

  markOffline(deviceId) {
    const farmMap = ensureFarmMap();
    if (!farmMap) return;

    const prev = farmMap.get(deviceId);
    if (!prev) return;

    farmMap.set(deviceId, { ...prev, status: "offline" });
    notifyUI();
  },

  get(deviceId) {
    const farmMap = ensureFarmMap();
    return farmMap ? farmMap.get(deviceId) : undefined;
  },

  getAll() {
    const farmMap = ensureFarmMap();
    return farmMap ? Array.from(farmMap.values()) : [];
  }
};
