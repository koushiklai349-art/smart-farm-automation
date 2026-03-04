const { runtime } = require("../../store/runtime.store");

function ensureGlobalAI() {
  runtime.globalAI = runtime.globalAI || {
    knowledgePool: {},
    performanceIndex: {},
    lastSync: null
  };
}

function aggregateFarmKnowledge(farmId) {
  ensureGlobalAI();

  const perf = runtime.arbitrationPerformance || {};
  const trust = runtime.trustIndex?.reasons || {};

  runtime.globalAI.knowledgePool[farmId] = {
    performance: perf,
    trust,
    timestamp: Date.now()
  };

  console.log("🌍 Farm Knowledge Synced:", farmId);
}

function evaluateGlobalPerformance() {
  ensureGlobalAI();

  const farms =
    runtime.globalAI.knowledgePool;

  const globalIndex = {};

  Object.values(farms).forEach(farm => {
    Object.keys(farm.performance || {})
      .forEach(reason => {

        globalIndex[reason] =
          (globalIndex[reason] || 0) +
          (farm.performance[reason].wins || 0);
      });
  });

  runtime.globalAI.performanceIndex =
    globalIndex;

  runtime.globalAI.lastSync = Date.now();

  console.log("🌍 Global Performance Updated");
}

function influenceLocalWeights() {
  const global =
    runtime.globalAI.performanceIndex || {};

  runtime.arbitrationWeights =
    runtime.arbitrationWeights || {};

  Object.keys(global).forEach(reason => {
    if (global[reason] > 50) {
      runtime.arbitrationWeights[reason] += 0.5;
    }
  });

  console.log("🌍 Global Influence Applied");
}

module.exports = {
  aggregateFarmKnowledge,
  evaluateGlobalPerformance,
  influenceLocalWeights
};