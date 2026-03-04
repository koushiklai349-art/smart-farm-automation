const { runtime } = require("../../store/runtime.store");

function ensureEvolutionStore() {
  runtime.aiEvolution = runtime.aiEvolution || {
    suppressedReasons: {},
    lastEvaluated: null
  };
}

function evaluateEngineStability() {
  ensureEvolutionStore();

  const perf = runtime.arbitrationPerformance || {};
  const trust = runtime.trustIndex?.reasons || {};
  const suppressed = runtime.aiEvolution.suppressedReasons;

  Object.keys(perf).forEach(reason => {

    const stats = perf[reason];
    if (stats.evaluations < 10) return;

    const successRate =
      stats.wins / stats.evaluations;

    const trustScore =
      trust[reason]?.score || 50;

    if (successRate < 0.3 && trustScore < 35) {
      suppressed[reason] = {
        since: Date.now(),
        reason: "LOW_PERFORMANCE_LOW_TRUST"
      };

      console.log("🚫 Engine Suppressed:", reason);
    }

    // Recovery logic
    if (
      suppressed[reason] &&
      successRate > 0.6 &&
      trustScore > 60
    ) {
      delete suppressed[reason];
      console.log("✅ Engine Restored:", reason);
    }
  });

  runtime.aiEvolution.lastEvaluated = Date.now();
}

function isReasonSuppressed(reason) {
  return runtime.aiEvolution?.suppressedReasons?.[reason];
}

module.exports = {
  evaluateEngineStability,
  isReasonSuppressed
};