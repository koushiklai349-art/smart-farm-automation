const { runtime } = require("../../store/runtime.store");

function evaluateSafeMode() {

  const health =
    runtime.systemHealth?.score || 100;

  runtime.strategy = runtime.strategy || {};
  runtime.strategy.mode =
    runtime.strategy.mode || "NORMAL";

  // 🔹 Enter Safe Mode
  if (health < 50 &&
      runtime.strategy.mode !== "CONSERVATIVE") {

    runtime.strategy.mode = "CONSERVATIVE";

    console.log("🛑 SAFE MODE ACTIVATED");
    console.log("Strategy switched to CONSERVATIVE");

    runtime.guard = runtime.guard || {};
    runtime.guard.safeModeActivatedAt = Date.now();
  }

  // 🔹 Recover from Safe Mode
  if (health > 75 &&
      runtime.strategy.mode === "CONSERVATIVE") {

    runtime.strategy.mode = "NORMAL";

    console.log("✅ SAFE MODE DEACTIVATED");
    console.log("Strategy restored to NORMAL");
  }
}

module.exports = {
  evaluateSafeMode
};