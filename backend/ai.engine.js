const fs = require("fs");

const STORE_FILE = "./store.json";
let store = JSON.parse(fs.readFileSync(STORE_FILE));

function loadStore() {
  store = JSON.parse(fs.readFileSync(STORE_FILE));
}

function saveStore() {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function evaluatePrediction() {

  loadStore();

  store.aiPredictions = store.aiPredictions || {};

  Object.entries(store.analytics?.temperatureHistory || {})
    .forEach(([deviceId, history]) => {

      if (history.length < 5) return;

      const temps = history.map(h => h.value);
      const avgTemp = average(temps);

      const risk = avgTemp > 30 ? "HIGH" :
                   avgTemp > 26 ? "MEDIUM" :
                   "LOW";

      store.aiPredictions[deviceId] = {
        heatStressRisk: risk,
        evaluatedAt: new Date().toISOString()
      };

      console.log(
        `🤖 AI Prediction → ${deviceId} Heat Risk:`,
        risk
      );
    });

  saveStore();
}

setInterval(evaluatePrediction, 30000);

console.log("🤖 AI Prediction engine started");
