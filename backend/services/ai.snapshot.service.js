const fs = require("fs");
const path = require("path");
const { runtime } = require("../store/runtime.store");

const FILE =
  path.join(__dirname, "../data/ai_snapshot.json");

function saveAISnapshot() {

  const snapshot = {
    arbitrationWeights: runtime.arbitrationWeights,
    trustIndex: runtime.trustIndex,
    strategy: runtime.strategy,
    aiStability: runtime.aiStability,
    savedAt: Date.now()
  };

  fs.writeFileSync(
    FILE,
    JSON.stringify(snapshot, null, 2)
  );

  console.log("💾 AI Snapshot Saved");
}

function loadAISnapshot() {

  if (!fs.existsSync(FILE)) return;

  const data =
    JSON.parse(fs.readFileSync(FILE, "utf8"));

  runtime.arbitrationWeights =
    data.arbitrationWeights || {};

  runtime.trustIndex =
    data.trustIndex || {};

  runtime.strategy =
    data.strategy || {};

  runtime.aiStability =
    data.aiStability || {};

  console.log("📦 AI Snapshot Restored");
}

module.exports = {
  saveAISnapshot,
  loadAISnapshot
};