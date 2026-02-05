const fs = require("fs");
const { getFarmId } = require("./utils/farm.resolver");

const STORE_FILE = "./store.json";
let store = JSON.parse(fs.readFileSync(STORE_FILE));

function loadStore() {
  store = JSON.parse(fs.readFileSync(STORE_FILE));
}

function saveStore(retry = 0) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
  } catch (err) {

    if (err.code === "EBUSY" && retry < 5) {
      setTimeout(() => saveStore(retry + 1), 50);
      return;
    }

    console.error("❌ Failed to save store.json", err);
  }
}

const COOLDOWN_MS = 30000;

function evaluateRules() {
  loadStore();

  if (store.config?.maintenanceMode === true) {
    console.log("🛠 Maintenance mode active → Rules paused");
    return;
  }

  Object.entries(store.sensorData || {}).forEach(([deviceId, data]) => {
    const farmId = getFarmId(deviceId, store);

    [...store.rules]
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .forEach(rule => {

        if (rule.enabled === false) return;
        if (rule.deviceId !== deviceId) return;

        const pumpState =
          store.actuatorState?.[deviceId]?.[rule.target];

        const override =
          store.overrideMode?.[deviceId]?.[rule.target] || "AUTO";

        if (override === "FORCE_ON") {
          queueCommand(deviceId, rule.target, "ON");
          rule.lastTriggeredAt = new Date().toISOString();
          return;
        }

        if (override === "FORCE_OFF") {
          queueCommand(deviceId, rule.target, "OFF");
          rule.lastTriggeredAt = new Date().toISOString();
          return;
        }

        // 🔥 Cooldown
        if (rule.lastTriggeredAt) {
          const diff =
            Date.now() - new Date(rule.lastTriggeredAt).getTime();
          if (diff < COOLDOWN_MS) return;
        }

        // ===============================
        // 🔥 Multi-condition rule support
        // ===============================

        if (rule.conditions) {

          const matched = evaluateConditions(data, rule);
          if (!matched) return;

          queueCommand(deviceId, rule.target, rule.value);
          rule.lastTriggeredAt = new Date().toISOString();

          console.log(`⚡ Multi-condition rule fired → ${deviceId}`);
          return;
        }

        // ===============================
        // 🔥 Legacy hysteresis support
        // ===============================

        const value = data[rule.sensor];
        if (value === undefined) return;

        if (value < rule.lowThreshold && pumpState !== "ON") {

          queueCommand(deviceId, rule.target, "ON");
          rule.lastTriggeredAt = new Date().toISOString();

          console.log(`💧 Soil LOW → Pump ON (${deviceId})`);
          return;
        }

        if (value > rule.highThreshold && pumpState !== "OFF") {

          queueCommand(deviceId, rule.target, "OFF");
          rule.lastTriggeredAt = new Date().toISOString();

          console.log(`🌞 Soil HIGH → Pump OFF (${deviceId})`);
          return;
        }

      });
  });
  const profile = getSpeciesProfile(deviceId);

if (profile && profile.fanControl) {

  const temp = data.temperature;

  if (temp > profile.maxTemp) {
    queueCommand(deviceId, "fan", "ON");
    console.log("🌡 Species heat detected → Fan ON");
  }

  if (temp < profile.minTemp) {
    queueCommand(deviceId, "fan", "OFF");
    console.log("🌡 Species cold → Fan OFF");
  }
}
if (profile?.minWaterLevel !== undefined) {

  const water = data.water_level;

  if (water < profile.minWaterLevel) {

    queueCommand(deviceId, "water_pump", "ON");

    console.log("💧 Water LOW → Pump ON");
  }

  if (water >= profile.minWaterLevel + 10) {

    queueCommand(deviceId, "water_pump", "OFF");

    console.log("💧 Water FULL → Pump OFF");
  }
}


  saveStore();
}


function queueCommand(deviceId, target, value) {

  store.actuatorState = store.actuatorState || {};
  store.actuatorState[deviceId] =
    store.actuatorState[deviceId] || {};

  const lastState =
    store.actuatorState[deviceId][target];

  // 🔥 Skip duplicate commands
  if (lastState === value) return;

  store.commandQueue[deviceId] =
    store.commandQueue[deviceId] || [];

  store.commandQueue[deviceId].push({
    id: Date.now() + "-" + Math.random(),
    action: { target, value },
    source: "RULE",
    retries: 0,
    status: "PENDING",
    createdAt: new Date().toISOString()
  });

  // 🔥 Save actuator state
  store.actuatorState[deviceId][target] = value;
}

function safetyWatchdog() {
  loadStore();

  const OFFLINE_TIMEOUT = 30000; // 30 sec

  Object.values(store.devices || {}).forEach(device => {

    const lastSeen = new Date(device.lastSeen).getTime();
    const diff = Date.now() - lastSeen;

    if (diff < OFFLINE_TIMEOUT) return;

    const deviceId = device.deviceId;

    const actuators =
      store.actuatorState?.[deviceId] || {};

    Object.entries(actuators).forEach(([target, state]) => {

      if (state === "OFF") return;

      console.log(`🚨 Fail-safe OFF triggered for ${deviceId}`);

      queueCommand(deviceId, target, "OFF");
    });
  });

  saveStore();
}

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

  if (rule.logic === "AND") {
    return results.every(Boolean);
  }

  if (rule.logic === "OR") {
    return results.some(Boolean);
  }

  return false;
}

function getSpeciesProfile(deviceId) {

  const species = store.devices?.[deviceId]?.species;
  if (!species) return null;

  return store.speciesProfiles?.[species] || null;
}


setInterval(safetyWatchdog, 10000);

setInterval(evaluateRules, 10000);

console.log("🧠 Hysteresis Rule Engine started");
