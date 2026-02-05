const fs = require("fs");

const STORE_FILE = "./store.json";
let store = JSON.parse(fs.readFileSync(STORE_FILE));

function loadStore() {
  store = JSON.parse(fs.readFileSync(STORE_FILE));
}

function saveStore() {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

function evaluateRecommendations() {

  loadStore();

  store.recommendations = store.recommendations || {};

  Object.entries(store.farmScore || {})
    .forEach(([deviceId, scoreObj]) => {

      const score = scoreObj.score;
      const prediction = store.aiPredictions?.[deviceId];

      let suggestions = [];

      if (score < 80) {
        suggestions.push("Environment stability needs improvement");
      }

      if (prediction?.heatStressRisk === "HIGH") {
        suggestions.push("Increase cooling / ventilation");
      }

      if (prediction?.heatStressRisk === "MEDIUM") {
        suggestions.push("Monitor barn temperature closely");
      }

      store.recommendations[deviceId] = {
        suggestions,
        generatedAt: new Date().toISOString()
      };

      console.log(
        `💡 Recommendation → ${deviceId}:`,
        suggestions
      );
    });

  saveStore();
}

setInterval(evaluateRecommendations, 45000);

console.log("💡 Recommendation engine started");
