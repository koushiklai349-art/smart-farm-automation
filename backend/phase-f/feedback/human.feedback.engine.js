const { runtime } = require("../../store/runtime.store");
const { saveAIMemory } =
  require("../../services/ai.memory.service");

function applyHumanFeedback({ reason, approved }) {

  if (!reason) return;

  runtime.arbitrationWeights =
    runtime.arbitrationWeights || {};

  const rate = runtime.metaLearning?.learningRate || 0.5;

  if (approved) {
    runtime.arbitrationWeights[reason] =
      (runtime.arbitrationWeights[reason] || 0) + rate;
  } else {
    runtime.arbitrationWeights[reason] =
      (runtime.arbitrationWeights[reason] || 0) - rate;
  }

  console.log("👤 Human Feedback Applied:", reason, approved);

  saveAIMemory();
}

module.exports = {
  applyHumanFeedback
};