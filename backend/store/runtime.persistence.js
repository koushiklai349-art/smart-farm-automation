const fs = require("fs");
const path = require("path");
const { runtime } = require("./runtime.store");

const filePath = path.join(__dirname, "../data/runtime_state.json");

function loadRuntime() {
  try {
    const raw = fs.readFileSync(filePath);
    const data = JSON.parse(raw);

    runtime.actuatorState = data.actuatorState || {};
    runtime.commandCooldown = data.commandCooldown || {};
    runtime.flipProtection = data.flipProtection || {};
  } catch (err) {
    console.log("Runtime state fresh start");
  }
}

function saveRuntime() {
  const data = {
    actuatorState: runtime.actuatorState,
    commandCooldown: runtime.commandCooldown,
    flipProtection: runtime.flipProtection
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  loadRuntime,
  saveRuntime
};