import { getActiveRules } from "./rule.store.js";
import { dispatchCommand } from "../command/command.dispatcher.js";
import { getSensorSnapshot } from "../store/sensor.store.js";
import { evaluateRule,evaluateRuleWithExplain } from "./rule.evaluator.js";
import { evaluateDecision } from "../governance/governance.engine.js";
import { DECISION_TYPE } from "../governance/governance.types.js";
import { deviceStore } from "../devices/device.store.js";
import { hasManualOverride } from "../auto-action/manual.override.store.js";
import { getAutoState,setAutoState } from "../auto-action/auto.state.store.js";
import { addAutoExplainEvent } from "../explain/explain.store.js";

// ✅ persist cooldown across runs
const lastRun = new Map();
let lastRunTs = 0;
const MIN_GAP = 300; // ms

// STEP 5.1 — basic automation rules (read-only)
const rules = [
  {
    id: "TEMP_HIGH_FAN_ON",
    when: ({ temperature }) => typeof temperature === "number" && temperature > 30,
    explain: "Temperature > 30°C"
  },
  {
    id: "SOIL_DRY_PUMP_ON",
    when: ({ soil_moisture }) => typeof soil_moisture === "number" && soil_moisture < 40,
    explain: "Soil moisture < 40%"
  },
  {
  id: "TEMP_NORMAL_FAN_OFF",
  when: ({ temperature }) =>
    typeof temperature === "number" && temperature < 27,
  explain: "Temperature < 27°C (fan off)"
},
{
  id: "SOIL_WET_PUMP_OFF",
  when: ({ soil_moisture }) =>
    typeof soil_moisture === "number" && soil_moisture > 55,
  explain: "Soil moisture > 55% (pump off)"
}

];

// Phase 6.3 — rule to device mapping
const RULE_DEVICE_MAP = {
  TEMP_HIGH_FAN_ON: ["esp32-cow-01", "esp32-goat-01"],
  TEMP_NORMAL_FAN_OFF: ["esp32-cow-01", "esp32-goat-01"],

  SOIL_DRY_PUMP_ON: ["esp32-fish-01"],
  SOIL_WET_PUMP_OFF: ["esp32-fish-01"]
};

// --- Guards ---
const AUTO_COOLDOWN_MS = 10_000; // 10s per rule+device
const lastAutoRun = new Map();

function canAutoRun(ruleId, deviceId) {
  const key = `${ruleId}:${deviceId}`;
  const last = lastAutoRun.get(key) || 0;
  if (Date.now() - last < AUTO_COOLDOWN_MS) return false;
  lastAutoRun.set(key, Date.now());
  return true;
}

function isAlreadyInState(deviceId, target, desired) {
  const device = deviceStore.get(deviceId);
  const current = device?.actuators?.[target];
  return current === desired;
}

export function evaluateRules(snapshot) {
  rules.forEach(rule => {
    try {
      if (rule.when(snapshot)) {
        console.log(
         "🧠 Rule matched:",
         rule.id,
         "-",
        rule.explain
        );
     console.log( "📍 Rule applies to devices:",rule.id,devices);

    const devices = getDevicesForRule(rule.id);

   devices.forEach(deviceId => {
  guardedAutoAction({
    ruleId: rule.id,
    deviceId,
    target: rule.id.includes("FAN") ? "fan" : "pump",
    action: rule.id.includes("_ON") ? "ON" : "OFF",
    explain: rule.explain
    });
   });

   }

    } catch (e) {
      console.warn("Rule error:", rule.id, e);
    }
  });
}

function guardedAutoAction({ ruleId, deviceId, target, action, explain }) {

  if (hasManualOverride(deviceId, target)) {
  console.log(
    "🛑 Auto paused (manual override):",
    deviceId,
    target
  );
  return;
  }

  if (!canAutoRun(ruleId, deviceId)) {
    console.log("⏳ Auto blocked (cooldown):", ruleId, deviceId);
    return;
  }

  console.log(
    "🤖 Auto action:",
    ruleId,
    "→",
    deviceId,
    target,
    action
  );

  const last = getAutoState(deviceId, target);
   if (last === action) {
    console.log(
     "🟡 Auto skipped (hysteresis hold):",
     deviceId,
     target,
     action
    );
   return;
  }
  const cmdId = crypto.randomUUID();

addAutoExplainEvent({
  type: "AUTO_ACTION",
  ruleId,
  deviceId,
  target,
  action,
  reason: explain,
  commandId: cmdId
});

dispatchCommand({
  id: cmdId,
  deviceId,
  action,
  source: "rule",
  explain: {
    type: "RULE",
    ruleId,
    evaluation: explain,
    at: Date.now()
  }
});

  setAutoState(deviceId, target, action);

}

function getDevicesForRule(ruleId) {
  return RULE_DEVICE_MAP[ruleId] || [];
}

/*
export function runRuleEngine() {
  const rules = getActiveRules();
  const now = Date.now();
  if (now - lastRunTs < MIN_GAP) return;
  lastRunTs = now;

  // ✅ ALWAYS fresh sensor snapshot
  const sensorData = getSensorSnapshot();

  rules.forEach(rule => {
    const match = evaluateRule(rule, sensorData);
    if (!match) return;
    
    // 🔍 explain capture (non-blocking)
    const explainResult =
    evaluateRuleWithExplain(rule, sensorData);

    const last = lastRun.get(rule.id) || 0;
    if (Date.now() - last < 5000) return;

    lastRun.set(rule.id, Date.now());
    
    evaluateDecision({
    decisionType: DECISION_TYPE.AUTO_ACTION,
    deviceId: rule.then.deviceId,
    context: {
    ruleId: rule.id,
    explain: explainResult.explain
    }
    });


     dispatchCommand({
      deviceId: rule.then.deviceId,
      action: rule.then.action,
      source: "rule",

      explain: {
      type: "RULE",
      ruleId: rule.id,
      evaluation: explainResult.explain,
      evaluatedAt: Date.now()
     }
    });
  });
}
*/
export function runRuleEngine() {
  // 🚫 TEMP DISABLED (Phase 5.2)
  return;
}
