// backend/phase-g/bridge/schedule.command.bridge.js

const { dispatchCommand } = require("../../phase-b/phase-b.index.js");

async function executeScheduleDecisions(decisions = []) {
  const results = [];

  for (const d of decisions) {
    try {
      const res = await dispatchCommand({
        commandId: generateCommandId(),
        deviceId: d.deviceId,
        action: mapAction(d.target, d.value),
        issuedAt: new Date().toISOString()
      });

      results.push({
        ...d,
        status: "SENT",
        result: res
      });
    } catch (err) {
      results.push({
        ...d,
        status: "FAILED",
        error: err.message
      });
    }
  }

  return results;
}

function generateCommandId() {
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2)
  );
}

function mapAction(target, value) {
  if (target === "fan") {
    return value === "ON" ? "FAN_ON" : "FAN_OFF";
  }
  if (target === "pump" || target === "water_pump") {
    return value === "ON" ? "PUMP_ON" : "PUMP_OFF";
  }
  return `${target.toUpperCase()}_${value.toUpperCase()}`;
}

module.exports = {
  executeScheduleDecisions
};
