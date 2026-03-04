const { runtime } = require("../store/runtime.store");

function recordLearning(deviceId, reason, success) {

  runtime.globalAI = runtime.globalAI || {};
  runtime.globalAI.knowledgePool =
    runtime.globalAI.knowledgePool || {};

  const key = reason;

  runtime.globalAI.knowledgePool[key] =
    runtime.globalAI.knowledgePool[key] || {
      success: 0,
      failure: 0
    };

  if (success)
    runtime.globalAI.knowledgePool[key].success++;
  else
    runtime.globalAI.knowledgePool[key].failure++;

}

function getBestAction(reason) {

  const data =
    runtime.globalAI?.knowledgePool?.[reason];

  if (!data) return null;

  const total = data.success + data.failure;

  if (total < 5) return null;

  const successRate = data.success / total;

  return {
    successRate,
    confidence: total
  };
}

module.exports = {
  recordLearning,
  getBestAction
};