const { runtime } = require("../../store/runtime.store");

function logDecisionExplanation({
  deviceId,
  action,
  reason,
  context
}) {

  const entry = {
    at: new Date().toISOString(),
    deviceId,
    action,
    reason,
    context
  };

  runtime.explainability.history.push(entry);

  if (runtime.explainability.history.length > 500)
    runtime.explainability.history.shift();

  console.log("[AI EXPLAIN]", entry);

  return entry;
}

module.exports = {
  logDecisionExplanation
};