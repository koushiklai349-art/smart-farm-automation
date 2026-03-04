// backend/phase-f/phase-f.index.js

const { runtime } = require("../store/runtime.store.js");
const { persistent } = require("../store/persistent.store.js");
const { evaluatePredictiveRisk } = require("./predictive/predictive.engine.js");
const { evaluateRulesAdapter } = require("./evaluator/rule.engine.adapter.js");
const { executeRuleDecisions } = require("./bridge/rule.command.bridge.js");

const RULE_INTERVAL_MS = 10000; // 10 sec (same as legacy, controlled)

/**
 * Single controlled rule loop.
 * Reads runtime, evaluates rules, dispatches via Phase-B.
 */
function startPhaseF() {
  console.log("🧠 Phase-F Rule Engine started");

  setInterval(async () => {
    try {
      const telemetryMap = runtime.telemetry || {};
      const devicesRuntime = runtime.devices || {};

      const rules = persistent.rules || [];
      const actuatorState = persistent.actuatorState || {};
      const speciesProfiles = persistent.speciesProfiles || {};

      for (const deviceId of Object.keys(devicesRuntime)) {
        const telemetry = telemetryMap[deviceId];
        if (!telemetry) continue;

        const species =
          persistent.devices?.[deviceId]?.species;

        const speciesProfile =
          speciesProfiles?.[species] || null;

        const decisions = evaluateRulesAdapter({
          deviceId,
          telemetry,
          rules,
          actuatorState,
          speciesProfile
        });

        if (decisions.length > 0) {
          await executeRuleDecisions(decisions);
        }
        // 🔮 Predictive Risk Evaluation
        const risk = evaluatePredictiveRisk(deviceId);

          if (risk >= 70) {
          console.log("⚠ HIGH PREDICTIVE RISK:", deviceId, risk);
        }
      }
    } catch (err) {
      console.error("[PHASE-F] rule loop error", err.message);
    }
  }, RULE_INTERVAL_MS);
}

module.exports = {
  startPhaseF
};
