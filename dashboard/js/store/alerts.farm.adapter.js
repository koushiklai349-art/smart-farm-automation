import { farmContext } from "../farm/farm.context.store.js";
import { notifyUI } from "./store.notifier.js";

const alertsByFarm = new Map(); // farmId -> alerts[]

function ensureFarmAlerts() {
  const farmId = farmContext.get();
  if (!farmId) return null;

  if (!alertsByFarm.has(farmId)) {
    alertsByFarm.set(farmId, []);
  }
  return alertsByFarm.get(farmId);
}

export const farmAlerts = {
  getAll() {
    const list = ensureFarmAlerts();
    return list || [];
  },

  add(alert) {
    const list = ensureFarmAlerts();
    if (!list) return;

    list.push({
      ...alert,
      time: alert.time || new Date().toLocaleTimeString()
    });
    notifyUI();
  },

  clear() {
    const list = ensureFarmAlerts();
    if (!list) return;
    list.length = 0;
    notifyUI();
  }
};
