const sensors = {};

export function updateSensor(type, value) {
  sensors[type] = {
    value,
    updatedAt: Date.now()
  };

  // 🔔 notify UI
  window.dispatchEvent(new CustomEvent("sensor:update"));
}

export function getSensorSnapshot() {
  const snapshot = {};
  for (const key in sensors) {
    snapshot[key] = sensors[key].value;
  }
  return snapshot;
}
window.__SENSORS__ = sensors;
// 🔁 Update full sensor snapshot (from backend)
export function updateSensorSnapshot(snapshot) {
  if (!snapshot) return;

  Object.entries(snapshot).forEach(([key, value]) => {
    updateSensor(key, value);
  });
}
