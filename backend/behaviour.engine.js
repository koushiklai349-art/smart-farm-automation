const fs = require("fs");

const STORE_FILE = "./store.json";
let store = JSON.parse(fs.readFileSync(STORE_FILE));

function loadStore() {
  store = JSON.parse(fs.readFileSync(STORE_FILE));
}

function saveStore() {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

function logAlert(deviceId, message) {

  store.auditLogs.push({
    event: "BEHAVIOUR_ALERT",
    deviceId,
    message,
    time: new Date().toISOString()
  });

  console.log("🧠 Behaviour alert:", deviceId, message);
}

function evaluateBehaviour() {

  loadStore();

  store.behaviourCache = store.behaviourCache || {};

  Object.entries(store.sensorData || {}).forEach(([deviceId, data]) => {

    const water = data.water_level;
    const cache = store.behaviourCache[deviceId] || {};

    // 💧 Water consumption anomaly
    if (cache.lastWater !== undefined) {

      const diff = Math.abs(water - cache.lastWater);

      if (diff > 30) {
        logAlert(deviceId, "Abnormal water level change");
      }
    }

    cache.lastWater = water;
    store.behaviourCache[deviceId] = cache;
  });

  saveStore();
}

setInterval(evaluateBehaviour, 15000);

console.log("🧠 Behaviour monitoring engine started");
