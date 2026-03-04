const { runtime } = require("../../store/runtime.store");

function evaluateBehaviourOutcome(deviceId) {

  const history =
    runtime.behaviourMemory?.decisions || [];

  if (!history.length) return;

  const currentTemp =
    runtime.telemetry?.[deviceId]?.sensors?.temperature;

  history.forEach(entry => {

    if (entry.deviceId !== deviceId) return;
    if (entry.evaluated) return;

    if (entry.beforeTemp == null || currentTemp == null)
      return;

    const improved =
      currentTemp < entry.beforeTemp;

    runtime.arbitrationWeights =
  runtime.arbitrationWeights || {};

runtime.swarmMemory =
  runtime.swarmMemory || { reasonPerformance: {} };

runtime.swarmMemory.reasonPerformance[entry.reason] =
  runtime.swarmMemory.reasonPerformance[entry.reason] ||
  { success: 0, failure: 0 };

const rate = runtime.metaLearning.learningRate;

if (improved) {
  runtime.arbitrationWeights[entry.reason] =
    (runtime.arbitrationWeights[entry.reason] || 0) + rate;
} else {
  runtime.arbitrationWeights[entry.reason] =
    (runtime.arbitrationWeights[entry.reason] || 0) - rate;
}

    entry.evaluated = true;
  });
}

module.exports = {
  evaluateBehaviourOutcome
};