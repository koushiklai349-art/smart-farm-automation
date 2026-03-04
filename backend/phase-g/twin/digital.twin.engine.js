const { runtime } = require("../../store/runtime.store");
const { evaluateRulesAdapter } = require("../../phase-f/evaluator/rule.engine.adapter");

function simulateDevice(deviceId, fakeTelemetry, rules) {

  const decisions = evaluateRulesAdapter({
    deviceId,
    telemetry: { sensors: fakeTelemetry },
    rules,
    actuatorState: runtime.actuatorState || {},
    speciesProfile: null
  });

  const result = {
    deviceId,
    input: fakeTelemetry,
    decisions,
    simulatedAt: new Date().toISOString()
  };

  runtime.digitalTwin.simulationHistory.push(result);

  if (runtime.digitalTwin.simulationHistory.length > 200)
    runtime.digitalTwin.simulationHistory.shift();

  console.log("[DIGITAL TWIN RESULT]", result);

  return result;
}

module.exports = {
  simulateDevice
};