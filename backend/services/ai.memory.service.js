const fs = require("fs");
const path = require("path");
const { runtime } = require("../store/runtime.store");

const FILE = path.join(__dirname, "../data/ai.memory.json");

function loadAIMemory() {
  if (!fs.existsSync(FILE)) return;

  const data = JSON.parse(fs.readFileSync(FILE, "utf8"));

  runtime.arbitrationWeights = data.arbitrationWeights || {};
  runtime.swarmMemory = data.swarmMemory || { reasonPerformance: {} };

  console.log("🧠 AI Memory Loaded");
}

function saveAIMemory() {
  const data = {
    arbitrationWeights: runtime.arbitrationWeights || {},
    swarmMemory: runtime.swarmMemory || { reasonPerformance: {} }
  };

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  loadAIMemory,
  saveAIMemory
};