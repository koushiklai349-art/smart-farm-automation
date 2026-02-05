const fs = require("fs");

const STORE_FILE = "./store.json";
let store = JSON.parse(fs.readFileSync(STORE_FILE));

function loadStore() {
  store = JSON.parse(fs.readFileSync(STORE_FILE));
}

function saveStore() {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

function pushHistory(map, deviceId, value) {

  map[deviceId] = map[deviceId] || [];

  map[deviceId].push({
    value,
    time: Date.now()
  });

  // Keep last 50 entries
  if (map[deviceId].length > 50) {
    map[deviceId].shift();
  }
}

function evaluateAnalytics() {

  loadStore();

  store.analytics = store.analytics || {};
  store.analytics.temperatureHistory =
    store.analytics.temperatureHistory || {};

  store.analytics.waterHistory =
    store.analytics.waterHistory || {};

  Object.entries(store.sensorData || {}).forEach(([deviceId, data]) => {

    pushHistory(
      store.analytics.temperatureHistory,
      deviceId,
      data.temperature
    );

    pushHistory(
      store.analytics.waterHistory,
      deviceId,
      data.water_level
    );
  });

  saveStore();
}

setInterval(evaluateAnalytics, 20000);

console.log("📊 Analytics engine started");
