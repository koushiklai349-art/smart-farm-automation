import { farmContext } from "../farm/farm.context.store.js";

const sensorsByFarm = new Map(); // farmId -> snapshot

function ensureFarm() {
  const farmId = farmContext.get();
  if (!farmId) return null;

  if (!sensorsByFarm.has(farmId)) {
    sensorsByFarm.set(farmId, {});
  }
  return sensorsByFarm.get(farmId);
}

export function updateSensorSnapshot(partial) {
  const snap = ensureFarm();
  if (!snap) return;

  Object.assign(snap, partial);

  window.dispatchEvent(new Event("sensor:update"));
}

export function getSensorSnapshot() {
  const snap = ensureFarm();
  return snap || {};
}
