const { runtime } = require("../../store/runtime.store");

function evaluateCriticalProtection() {

  const stability =
    runtime.aiStability?.score || 100;

  if (stability < 30) {

    runtime.strategy.mode = "CONSERVATIVE";

    runtime.architecture = {
      PREDICTIVE: false,
      SWARM: false,
      LONG_TERM: true,
      META: true,
      GLOBAL: true
    };

    console.log("🚨 CRITICAL AI PROTECTION ACTIVATED");
  }
}

module.exports = {
  evaluateCriticalProtection
};