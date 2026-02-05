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
