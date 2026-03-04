const { runtime } = require("../../store/runtime.store");

function trackEnergyUsage(deviceId, action) {

  if (!runtime.energy.lastReset)
    runtime.energy.lastReset = new Date().toDateString();

  const today = new Date().toDateString();

  // Reset daily usage
  if (runtime.energy.lastReset !== today) {
    runtime.energy.todayUsage = 0;
    runtime.energy.lastReset = today;
    runtime.energy._incidentReported = false;
  }

  // Simple cost model
  if (action.includes("FAN_ON"))
    runtime.energy.todayUsage += 5;

  if (action.includes("PUMP_ON"))
    runtime.energy.todayUsage += 8;

  console.log(
    "[ENERGY TRACK]",
    runtime.energy.todayUsage
  );
}

function isEnergyBudgetExceeded() {
  return runtime.energy.todayUsage >
         runtime.energy.dailyLimit;
}

module.exports = {
  trackEnergyUsage,
  isEnergyBudgetExceeded
};