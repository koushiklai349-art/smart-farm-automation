// backend/phase-e/handlers/device.telemetry.handler.js

const { runtime } = require("../../store/runtime.store");
const { evaluateRulesAdapter } = require("../../phase-f/evaluator/rule.engine.adapter");
const { getRulesForDevice, getRulesForLine, getFarmRules } = require("../../store/rule.store");
const { dispatchCommand } = require("../../phase-b/phase-b.index");
const { evaluateDeviceHealth, evaluateFarmHealth } = require("../../phase-f/health/health.engine");
const { recordSensor, detectAnomaly } = require("../../phase-f/anomaly/anomaly.engine");
const { evaluatePredictiveRisk, evaluateRiskTrend } = require("../../phase-f/predictive/predictive.engine");
const { evaluateEscalation } = require("../../phase-f/escalation/escalation.engine");
const { autoTuneRules } = require("../../phase-f/autotune/autotune.engine");
const { evaluateMaintenance } = require("../../phase-f/maintenance/maintenance.engine");
const { recordTelemetryHistory, recordHealthHistory, recordRiskHistory } = require("../../phase-f/analytics/analytics.engine");
const { evaluateDeviceReliability, evaluateFarmEfficiency } = require("../../phase-f/scoring/scoring.engine");
const { evaluateDeviceOptimization, evaluateFarmOptimization } = require("../../phase-f/optimization/optimization.engine");
const { learnFromHistory } = require("../../phase-f/learning/learning.engine");
const { evaluateCoordination } = require("../../phase-f/coordination/coordination.engine");
const { evaluateSeason } = require("../../phase-f/season/season.engine");
const { createIncident } = require("../../phase-f/incident/incident.engine");
const { evaluateSwarmBalance } = require("../../phase-f/swarm/swarm.engine");
const { evaluateFailover } = require("../../phase-f/failover/failover.engine");
const { evaluateSwarmVoting } = require("../../phase-f/swarm/swarm.voting.engine");
const { evaluateAdaptiveMode } = require("../../phase-f/adaptive/adaptive.engine");
const { adjustThresholds } = require("../../phase-f/adaptive/threshold.adjuster");
const { evaluateConfidence } = require("../../phase-f/confidence/confidence.engine");
const { recalibrateThreshold } = require("../../phase-f/learning/threshold.recalibration.engine");
const { evaluateSwarmIntelligence } = require("../../phase-f/swarm/swarm.intelligence.engine");
const { evaluateFarmBrain } = require("../../phase-f/farm-brain/farm.brain.engine");
const { evaluateTrustIndex } = require("../../phase-f/trust/trust.engine");
const { evaluateArchitecture,isModuleActive } = require("../../phase-f/meta/ai.architecture.engine");
const { enforceMemoryLimits } = require("../../phase-f/guard/runtime.guard.engine");
const { proposeDecision, resolveArbitration } = require("../../phase-f/arbitration/arbitration.engine");
const { evaluateRuntimeHealth } = require("../../phase-f/guard/runtime.health.monitor");
const { evaluateSafeMode } = require("../../phase-f/guard/auto.safe.mode.engine");
const { evaluateDriftContainment } = require("../../phase-f/guard/drift.containment.engine");
const { evaluateAIStability } = require("../../phase-f/guard/ai.stability.engine");
const { evaluateCriticalProtection } = require("../../phase-f/guard/critical.protection.engine");

async function handleDeviceTelemetry(payload) {

  if (!payload || !payload.device_id) return;

  const deviceId = payload.device_id;

  /* -------------------- RUNTIME UPDATE -------------------- */

  runtime.telemetry = runtime.telemetry || {};
  runtime.devices = runtime.devices || {};
  runtime.metrics = runtime.metrics || {};

  runtime.telemetry[deviceId] = {
    lastUpdated: new Date().toISOString(),
    sensors: {
      temperature: payload.temperature ?? null,
      humidity: payload.humidity ?? null,
      soil_moisture: payload.soil_moisture ?? null
    },
    meta: { uptime: payload.uptime ?? null }
  };

  runtime.devices[deviceId] = runtime.devices[deviceId] || {};
  runtime.devices[deviceId].status = "ONLINE";
  runtime.devices[deviceId].lastSeen = new Date().toISOString();

  runtime.metrics.telemetryCount =
    (runtime.metrics.telemetryCount || 0) + 1;

  console.log("[PHASE-E][TELEMETRY]", deviceId, runtime.telemetry[deviceId]);

  /* -------------------- ANALYTICS -------------------- */

  recordTelemetryHistory(deviceId, runtime.telemetry[deviceId].sensors);
  learnFromHistory(deviceId);
  evaluateSeason();

  /* -------------------- RULE ENGINE -------------------- */

  const deviceRules = getRulesForDevice(deviceId);
  const lineRules = runtime.devices[deviceId]?.lineId
    ? getRulesForLine(runtime.devices[deviceId].lineId)
    : [];

  const allRules = [...deviceRules, ...lineRules];

  if (allRules.length > 0) {
    const decisions = evaluateRulesAdapter({
      deviceId,
      telemetry: runtime.telemetry[deviceId],
      rules: allRules,
      actuatorState: runtime.actuatorState || {}
    });

    for (const decision of decisions) {
      const action = decision.target.toUpperCase() + "_" + decision.value;

      if (!evaluateSwarmVoting(deviceId, action)) continue;

      proposeDecision({
        deviceId,
        action,
        reason: decision.reason,
        source: "SYSTEM_RULE",
        role: "SYSTEM"
      });
    }
  }

  /* -------------------- FARM BRAIN -------------------- */

  await evaluateFarmBrain();

  /* -------------------- ANOMALY -------------------- */

  recordSensor(deviceId, runtime.telemetry[deviceId].sensors);
  autoTuneRules(deviceId);

  if (detectAnomaly(deviceId)) {
    proposeDecision({
      deviceId,
      action: "FAN_ON",
      reason: "SENSOR_ANOMALY",
      source: "SYSTEM_AI",
      role: "SYSTEM"
    });
  }

  /* -------------------- HEALTH -------------------- */

  evaluateDeviceHealth(deviceId);
  evaluateFarmHealth();
  recordHealthHistory(deviceId);

  const healthScore = runtime.health?.devices?.[deviceId];

  if (healthScore !== undefined && healthScore < 40) {
    createIncident({ type: "HEALTH_CRITICAL", deviceId });

    proposeDecision({
      deviceId,
      action: "FAN_ON",
      reason: "HEALTH_CRITICAL",
      source: "SYSTEM_AI",
      role: "SYSTEM"
    });
  }

  /* -------------------- PREDICTIVE -------------------- */

  let riskScore = null;

if (isModuleActive("PREDICTIVE")) {
  riskScore = evaluatePredictiveRisk(deviceId);
}
  evaluateRiskTrend(deviceId);
  recordRiskHistory(deviceId);

  if (riskScore >= 50) {
    createIncident({ type: "PREDICTIVE_RISK", deviceId });

    proposeDecision({
      deviceId,
      action: "FAN_ON",
      reason: "PREDICTIVE_PREVENTION",
      source: "SYSTEM_AI",
      role: "SYSTEM"
    });
  }

  /* -------------------- ADAPTIVE -------------------- */

  evaluateAdaptiveMode(deviceId);
  adjustThresholds(deviceId);
  evaluateConfidence(deviceId);
  recalibrateThreshold(deviceId);

  /* -------------------- COORDINATION + SWARM -------------------- */

  await evaluateEscalation(deviceId);
  await evaluateCoordination(deviceId);
  await evaluateDeviceOptimization(deviceId);
  await evaluateSwarmBalance();
  await evaluateSwarmIntelligence();
  await evaluateFailover();

  evaluateMaintenance(deviceId);
  evaluateDeviceReliability(deviceId);
  evaluateFarmEfficiency();
  evaluateFarmOptimization();
  evaluateArchitecture();
  /* -------------------- ARBITRATION -------------------- */

  const winner = resolveArbitration();

  if (winner) {
    await dispatchCommand({
      commandId: Date.now().toString(),
      deviceId: winner.deviceId,
      action: winner.action,
      issuedAt: new Date().toISOString(),
      reason: winner.reason,
      source: winner.source,
      role: winner.role
    });
    evaluateTrustIndex();
  }
enforceMemoryLimits();
evaluateRuntimeHealth();
evaluateSafeMode();
evaluateDriftContainment();
evaluateAIStability();
evaluateCriticalProtection();

}

module.exports = { handleDeviceTelemetry };