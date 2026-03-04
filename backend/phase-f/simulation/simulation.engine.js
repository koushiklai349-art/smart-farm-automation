const { runtime } = require("../../store/runtime.store");
const { evaluateRulesAdapter } =
  require("../evaluator/rule.engine.adapter");

function runSimulation({ deviceId, sensors, rules }) {

  if (!deviceId || !sensors) {
    return { error: "INVALID_SIMULATION_INPUT" };
  }

  runtime.simulation.enabled = true;

  const decisions = evaluateRulesAdapter({
    deviceId,
    telemetry: { sensors },
    rules,
    actuatorState: runtime.actuatorState || {},
    speciesProfile: null
  });

  const result = {
    at: new Date().toISOString(),
    deviceId,
    sensors,
    decisions
  };

  runtime.simulation.lastScenario = result;
  runtime.simulation.results.push(result);

  if (runtime.simulation.results.length > 50)
    runtime.simulation.results.shift();

  runtime.simulation.enabled = false;

  return result;
}

module.exports = {
  runSimulation
};