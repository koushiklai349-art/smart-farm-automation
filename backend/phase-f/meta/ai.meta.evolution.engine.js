const { runtime } = require("../../store/runtime.store");

function ensureMetaEvolution() {
  runtime.metaEvolution = runtime.metaEvolution || {
    aggressivenessFactor: 1,
    trustSensitivity: 1,
    strategySensitivity: 1,
    lastEvaluated: null
  };
}

function evaluateMetaEvolution() {
  ensureMetaEvolution();

  const perf = runtime.arbitrationPerformance || {};
  const history = runtime.arbitrationHistory || [];

  if (history.length < 50) return;

  let volatility = 0;

  history.slice(-30).forEach(entry => {
    if (!entry.winner) return;
    volatility += Math.abs(entry.winner.score || 0);
  });

  volatility = volatility / 30;

  // 🔹 If volatility too high → reduce aggressiveness
  if (volatility > 120) {
    runtime.metaEvolution.aggressivenessFactor *= 0.9;
    console.log("🧬 Reduced Aggressiveness (Meta)");
  }

  // 🔹 If volatility too low → increase exploration
  if (volatility < 60) {
    runtime.metaEvolution.aggressivenessFactor *= 1.05;
    console.log("🧬 Increased Aggressiveness (Meta)");
  }

  // 🔹 Trust Sensitivity Adjust
  const avgTrust =
    Object.values(runtime.trustIndex?.reasons || {})
      .reduce((a, b) => a + (b.score || 0), 0) /
    (Object.keys(runtime.trustIndex?.reasons || {}).length || 1);

  if (avgTrust < 50) {
    runtime.metaEvolution.trustSensitivity *= 1.1;
    console.log("🧬 Increased Trust Sensitivity");
  }

  if (avgTrust > 80) {
    runtime.metaEvolution.trustSensitivity *= 0.95;
  }

  // 🔹 Clamp values
  runtime.metaEvolution.aggressivenessFactor =
    clamp(runtime.metaEvolution.aggressivenessFactor, 0.5, 2);

  runtime.metaEvolution.trustSensitivity =
    clamp(runtime.metaEvolution.trustSensitivity, 0.5, 2);

  runtime.metaEvolution.strategySensitivity =
    clamp(runtime.metaEvolution.strategySensitivity, 0.5, 2);

  runtime.metaEvolution.lastEvaluated = Date.now();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

module.exports = {
  evaluateMetaEvolution
};