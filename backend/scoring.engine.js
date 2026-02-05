const fs = require("fs");

const STORE_FILE = "./store.json";
let store = JSON.parse(fs.readFileSync(STORE_FILE));

function loadStore() {
  store = JSON.parse(fs.readFileSync(STORE_FILE));
}

function saveStore() {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

function evaluateScore() {

  loadStore();

  store.farmScore = store.farmScore || {};

  Object.entries(store.aiPredictions || {})
    .forEach(([deviceId, prediction]) => {

      let score = 100;

      if (prediction.heatStressRisk === "MEDIUM") {
        score -= 20;
      }

      if (prediction.heatStressRisk === "HIGH") {
        score -= 40;
      }

      store.farmScore[deviceId] = {
        score,
        evaluatedAt: new Date().toISOString()
      };

      console.log(
        `📊 Farm Score → ${deviceId}:`,
        score
      );
    });

  saveStore();
}

setInterval(evaluateScore, 40000);

console.log("📊 Farm scoring engine started");
