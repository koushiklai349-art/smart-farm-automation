// backend/phase-f/bridge/rule.command.bridge.js

const { dispatchCommand } = require("../../phase-b/phase-b.index.js");

/**
 * Turns rule decisions into real commands via Phase-B dispatcher.
 * NO RULE LOGIC HERE.
 */
async function executeRuleDecisions(decisions = []) {
  if (!Array.isArray(decisions) || decisions.length === 0) return [];

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
        deviceId: d.deviceId,
        target: d.target,
        value: d.value,
        status: "SENT",
        reason: d.reason,
        result: res
      });
    } catch (err) {
      results.push({
        deviceId: d.deviceId,
        target: d.target,
        value: d.value,
        status: "FAILED",
        reason: d.reason,
        error: err.message
      });
    }
  }

  return results;
}

// --- helpers ---
function generateCommandId() {
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2)
  );
}

/**
 * Map rule target/value to Phase-B action string.
 * Keep this mapping explicit.
 */
function mapAction(target, value) {
  // Examples (extend as needed)
  if (target === "fan") {
    return value === "ON" ? "FAN_ON" : "FAN_OFF";
  }
  if (target === "pump" || target === "water_pump") {
    return value === "ON" ? "PUMP_ON" : "PUMP_OFF";
  }

  // Fallback: uppercase join
  return `${String(target).toUpperCase()}_${String(value).toUpperCase()}`;
}

module.exports = {
  executeRuleDecisions
};
