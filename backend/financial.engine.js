const fs = require("fs");

const STORE_FILE = "./store.json";
let store = JSON.parse(fs.readFileSync(STORE_FILE));

function loadStore() {
  store = JSON.parse(fs.readFileSync(STORE_FILE));
}

function saveStore() {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

function evaluateFinancials() {

  loadStore();

  store.financials = store.financials || {};

  Object.entries(store.farmScore || {})
    .forEach(([deviceId, scoreObj]) => {

      const score = scoreObj.score;

      // Simple ROI estimation model
      let efficiency = score / 100;

      let projectedProfit =
        Math.round(1000 * efficiency); // demo model

      store.financials[deviceId] = {
        efficiency,
        projectedProfit,
        calculatedAt: new Date().toISOString()
      };

      console.log(
        `💰 Financial Estimate → ${deviceId}:`,
        projectedProfit
      );
    });

  saveStore();
}

setInterval(evaluateFinancials, 60000);

console.log("💰 Financial intelligence engine started");
