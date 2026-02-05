import { farmContext } from "../farm/farm.context.store.js";
import { notifyUI } from "./store.notifier.js";

const metricsByFarm = new Map();

function ensureFarmMetrics() {
  const farmId = farmContext.get();
  if (!farmId) return null;

  if (!metricsByFarm.has(farmId)) {
    metricsByFarm.set(farmId, {
      temperature: null,
      humidity: null,
      soil_moisture: null,
      source: null
    });
  }
  return metricsByFarm.get(farmId);
}

export const farmMetrics = {
  get() {
    return ensureFarmMetrics() || {};
  },

  update(partial) {
    const m = ensureFarmMetrics();
    if (!m) return;

    Object.assign(m, partial);
    notifyUI();
  }
};
