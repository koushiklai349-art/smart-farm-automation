const fs = require("fs");

const STORE_FILE = "./store.json";
let store = JSON.parse(fs.readFileSync(STORE_FILE));

let lastTemps = {};

function loadStore() {
  store = JSON.parse(fs.readFileSync(STORE_FILE));
}

function logAlert(deviceId, message) {

  store.auditLogs = store.auditLogs || [];

  store.auditLogs.push({
    event: "HEALTH_ALERT",
    deviceId,
    message,
    time: new Date().toISOString()
  });

  console.log("🚨 HEALTH ALERT:", deviceId, message);
}

function evaluateHealth() {

  loadStore();

  Object.entries(store.sensorData || {}).forEach(([deviceId, data]) => {

    const temp = data.temperature;
    const humidity = data.humidity;

    const alerts = store.alerts || {};

    // 🔥 Heat stress
    if (temp > alerts.heatStressTemp) {
      logAlert(deviceId, "Heat stress risk");
    }

    // 🌫 Dangerous humidity
    if (humidity > alerts.humidityDanger) {
      logAlert(deviceId, "Humidity dangerous");
    }

    // ⚡ Rapid temperature spike
    const lastTemp = lastTemps[deviceId];

    if (lastTemp !== undefined) {

      const diff = Math.abs(temp - lastTemp);

      if (diff > alerts.rapidTempChange) {
        logAlert(deviceId, "Rapid temperature change");
      }
    }

    lastTemps[deviceId] = temp;
  });

  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

setInterval(evaluateHealth, 10000);

console.log("🩺 Health monitoring engine started");
