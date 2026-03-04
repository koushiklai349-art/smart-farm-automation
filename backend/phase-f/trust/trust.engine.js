const { runtime } = require("../../store/runtime.store");

function ensureTrustStructure() {

  runtime.trustIndex =
    runtime.trustIndex || {};

  runtime.trustIndex.reasons =
    runtime.trustIndex.reasons || {};

  runtime.trustIndex.devices =
    runtime.trustIndex.devices || {};

  runtime.trustIndex.engines =
    runtime.trustIndex.engines || {};

  runtime.trustIndex.lastEvaluated =
    runtime.trustIndex.lastEvaluated || null;
}

// 🔹 Reason-level trust (based on swarm performance)
function evaluateReasonTrust() {
  const swarm = runtime.swarmMemory?.reasonPerformance || {};
  const trust = runtime.trustIndex.reasons || {};

  Object.keys(swarm).forEach(reason => {
    const success = swarm[reason].success || 0;
    const failure = swarm[reason].failure || 0;

    const total = success + failure;
    if (total === 0) return;

    const score = Math.round((success / total) * 100);

    trust[reason] = {
      score,
      lastUpdated: Date.now()
    };
  });
}

// 🔹 Device-level trust
function evaluateDeviceTrust() {
  const devices = runtime.devices || {};
  const deviceTrust = runtime.trustIndex.devices;

  Object.keys(devices).forEach(deviceId => {
    const health = runtime.health?.devices?.[deviceId] || 100;
    const risk = runtime.predictive?.devices?.[deviceId]?.riskScore || 0;

    const score = Math.max(0, Math.min(100,
      Math.round((health * 0.7) - (risk * 0.3))
    ));

    deviceTrust[deviceId] = {
      score,
      lastUpdated: Date.now()
    };
  });
}

// 🔹 Engine-level trust (based on arbitration results)
function evaluateEngineTrust() {
  const history = runtime.arbitrationHistory || [];
  const engineTrust = runtime.trustIndex.engines;

  const engineStats = {};

  history.forEach(entry => {
    const winnerReason = entry.winner?.reason;
    if (!winnerReason) return;

    engineStats[winnerReason] =
      engineStats[winnerReason] || { wins: 0 };

    engineStats[winnerReason].wins++;
  });

  Object.keys(engineStats).forEach(reason => {
    engineTrust[reason] = {
      score: Math.min(100, engineStats[reason].wins * 5),
      lastUpdated: Date.now()
    };
  });
}

// 🔹 Trust Decay (prevents infinite 100 score)
function applyTrustDecay() {
  const decayFactor = 0.98;

  Object.values(runtime.trustIndex.reasons).forEach(r => {
    r.score = Math.round(r.score * decayFactor);
  });

  Object.values(runtime.trustIndex.devices).forEach(d => {
    d.score = Math.round(d.score * decayFactor);
  });

  Object.values(runtime.trustIndex.engines).forEach(e => {
    e.score = Math.round(e.score * decayFactor);
  });
}

// 🔹 Main entry
function evaluateTrustIndex() {
  ensureTrustStructure();

  evaluateReasonTrust();
  evaluateDeviceTrust();
  evaluateEngineTrust();
  applyTrustDecay();

  runtime.trustIndex.lastEvaluated = Date.now();

  console.log("🔐 AI Trust Index Fully Updated");
}

module.exports = {
  evaluateTrustIndex
};