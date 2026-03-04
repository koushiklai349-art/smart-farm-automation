// backend/phase-f/evaluator/rule.engine.adapter.js

/**
 * This adapter wraps the legacy rule engine logic
 * and converts runtime telemetry into rule decisions.
 *
 * NO IO
 * NO MQTT
 * NO DISPATCH
 */

function evaluateRulesAdapter({
  deviceId,
  telemetry,
  rules,
  actuatorState,
  speciesProfile,
  now = Date.now()
}) {
  const decisions = [];

  if (!telemetry || !rules || rules.length === 0)
  return decisions;

  const data = telemetry.sensors || {};

  // priority first (same as legacy)
  const sortedRules = [...rules].sort(
    (a, b) => (b.priority || 0) - (a.priority || 0)
  );

  sortedRules.forEach(rule => {
    if (rule.enabled === false) return;
    if (rule.deviceId !== deviceId) return;

    // cooldown
    if (rule.lastTriggeredAt) {
      const diff = now - new Date(rule.lastTriggeredAt).getTime();
      if (diff < (rule.cooldownMs || 30000)) return;
    }

    // multi-condition rules
    if (rule.conditions) {
      const matched = evaluateConditions(data, rule);
      if (!matched) return;

      decisions.push({
        deviceId,
        target: rule.target,
        value: rule.value,
        reason: "RULE_CONDITIONS"
      });

      rule.lastTriggeredAt = new Date().toISOString();
      return;
    }

    // legacy hysteresis
    const value = data[rule.sensor];
    if (value === undefined) return;
    const stateMap = actuatorState?.[deviceId] || {};
    const targetState = stateMap[rule.target];

 // Correct hysteresis logic (Cooling Control)

if (value > rule.highThreshold && targetState !== "ON") {
  decisions.push({
    deviceId,
    target: rule.target,
    value: "ON",
    reason: "HIGH_THRESHOLD"
  });
  rule.lastTriggeredAt = new Date().toISOString();
}

else if (value < rule.lowThreshold && targetState !== "OFF") {
  decisions.push({
    deviceId,
    target: rule.target,
    value: "OFF",
    reason: "LOW_THRESHOLD"
  });
  rule.lastTriggeredAt = new Date().toISOString();
}
  });

  // species profile logic (kept)
  if (speciesProfile) {
    const temp = data.temperature;

    if (speciesProfile.fanControl && temp !== undefined) {
      if (temp > speciesProfile.maxTemp) {
        decisions.push({
          deviceId,
          target: "fan",
          value: "ON",
          reason: "SPECIES_HEAT"
        });
      }

      if (temp < speciesProfile.minTemp) {
        decisions.push({
          deviceId,
          target: "fan",
          value: "OFF",
          reason: "SPECIES_COLD"
        });
      }
    }
  }

  return decisions;
}

// --- helpers (copied safely from legacy logic) ---
function evaluateConditions(data, rule) {
  if (!rule.conditions) return false;

  const results = rule.conditions.map(cond => {
    const sensorValue = data[cond.sensor];
    if (sensorValue === undefined) return false;

    if (cond.operator === "<") return sensorValue < cond.value;
    if (cond.operator === ">") return sensorValue > cond.value;
    if (cond.operator === "==") return sensorValue == cond.value;
    return false;
  });

  if (rule.logic === "AND") return results.every(Boolean);
  if (rule.logic === "OR") return results.some(Boolean);
  return false;
}

module.exports = {
  evaluateRulesAdapter
};
