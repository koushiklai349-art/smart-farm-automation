const { runtime } = require("../../store/runtime.store");
const { saveAIMemory } = require("../../services/ai.memory.service");
const { evaluateAIDrift } = require("../guard/ai.guard.engine");
const { evaluateMetaLearning } = require("../meta/meta.learning.engine");
const { evaluateTrustIndex } = require("../trust/trust.engine");
const { applySelfHealing } = require("../healing/self.healing.engine");
const { evaluateStrategy } = require("../strategy/strategy.engine");
const { evaluateSelfOptimization } = require("../optimization/ai.self.optimization.engine");
const { recordArbitrationOutcome,recordArbitrationEvaluation,autoRebalanceWeights } = require("./arbitration.performance.engine");
const { evaluateEngineStability,isReasonSuppressed } = require("../governance/ai.evolution.engine");
const { evaluateLongTermOptimization } = require("../optimization/ai.longterm.memory.engine");
const { evaluateMetaEvolution } = require("../meta/ai.meta.evolution.engine");
const { aggregateFarmKnowledge,evaluateGlobalPerformance,influenceLocalWeights } = require("../global/ai.global.cluster.engine");
const { saveAISnapshot } = require("../../services/ai.snapshot.service");


function ensureArbitration() {
  runtime.arbitrationQueue = runtime.arbitrationQueue || [];
  runtime.arbitrationHistory = runtime.arbitrationHistory || [];
  runtime.arbitrationWeights = runtime.arbitrationWeights || {};
}

function proposeDecision(decision) {
  ensureArbitration();

  runtime.arbitrationQueue.push({
    ...decision,
    proposedAt: Date.now()
  });
}

function getTrustMultiplier(reason) {
  const trustScore =
    runtime.trustIndex?.reasons?.[reason]?.score || 50;

  if (trustScore >= 80) return 1.2;
  if (trustScore >= 60) return 1.0;
  if (trustScore >= 40) return 0.8;
  return 0.5;
}

function calculateScore(decision) {

  if (isReasonSuppressed(decision.reason)) {
  return -999; // Force reject suppressed engine
}
  const baseScores = {
    FARM_BRAIN_GLOBAL_COOLING: 100,
    HEALTH_CRITICAL: 95,
    PREDICTIVE_PREVENTION: 90,
    SENSOR_ANOMALY: 85,
    SWARM_FAILOVER: 80,
    HIGH_THRESHOLD: 60,
    LOW_THRESHOLD: 60
  };

  const base = baseScores[decision.reason] || 50;

  const dynamic =
    runtime.arbitrationWeights[decision.reason] || 0;

  const swarm =
    runtime.swarmMemory?.reasonPerformance?.[decision.reason];

  let swarmBoost = 0;

  if (swarm) {
    const total = swarm.success + swarm.failure;
    if (total > 5) {
      swarmBoost =
        (swarm.success - swarm.failure) * 0.3;
    }
  }

  const trustMultiplier =
    getTrustMultiplier(decision.reason);

  const strategy = runtime.strategy?.mode;

  let strategyMultiplier = 1;

  if (strategy === "AGGRESSIVE")
    strategyMultiplier = 1.2;
  if (strategy === "CONSERVATIVE")
    strategyMultiplier = 0.8;

  const finalScore =
    (base + dynamic + swarmBoost) *
    trustMultiplier *
    strategyMultiplier;

  return finalScore;
}

function resolveArbitration() {
  ensureArbitration();

  const queue = runtime.arbitrationQueue;
  if (!queue.length) return null;

  queue.forEach(entry => {
    entry.score = calculateScore(entry);
  });
  recordArbitrationEvaluation(queue);
  queue.sort((a, b) => b.score - a.score);

  const winner = queue[0];

  // 🔁 Weight Adjustment (Learning)
  runtime.arbitrationWeights[winner.reason] =
    (runtime.arbitrationWeights[winner.reason] || 0) + 1;

  queue.slice(1).forEach(loser => {
    runtime.arbitrationWeights[loser.reason] =
      (runtime.arbitrationWeights[loser.reason] || 0) - 0.2;
  });
  
  runtime.arbitrationHistory.push({
    timestamp: Date.now(),
    winner,
    competitors: [...queue]
  });

  runtime.arbitrationQueue = [];

  recordArbitrationOutcome(winner);
  autoRebalanceWeights();
  evaluateEngineStability();
  evaluateLongTermOptimization();
  evaluateMetaEvolution();

  console.log("🧠 FINAL TRUST-AWARE ARBITRATION");
  console.log("🏆 Winner:", winner.reason,
              "| Score:", winner.score);

  // 🔐 Governance + Evolution Chain
  evaluateTrustIndex();
  evaluateSelfOptimization();
  evaluateStrategy();
  applySelfHealing();
  evaluateMetaLearning();
  evaluateAIDrift();
  saveAIMemory();
  aggregateFarmKnowledge("farm-01");
  evaluateGlobalPerformance();
  influenceLocalWeights();
  saveAISnapshot();
  
  return winner;
}

module.exports = {
  proposeDecision,
  resolveArbitration
};