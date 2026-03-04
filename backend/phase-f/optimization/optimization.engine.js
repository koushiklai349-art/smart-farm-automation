const { runtime } = require("../../store/runtime.store");
const { isEnergyBudgetExceeded } = require("../energy/energy.engine");
const { createIncident } = require("../incident/incident.engine");

async function evaluateDeviceOptimization(deviceId, dispatchCommand) {

  const telemetry = runtime.telemetry?.[deviceId]?.sensors;
  const actuatorState = runtime.actuatorState?.[deviceId] || {};

  if (!telemetry) return;
  
  // ===============================
// ENERGY BUDGET INCIDENT CHECK
// ===============================

if (isEnergyBudgetExceeded()) {

  const alreadyReported =
    runtime.energy._incidentReported;

  if (!alreadyReported) {

    createIncident({
      type: "ENERGY_BUDGET_EXCEEDED",
      deviceId,
      details: {
        usage: runtime.energy.todayUsage,
        limit: runtime.energy.dailyLimit
      }
    });

    runtime.energy._incidentReported = true;
  }

} else {
  runtime.energy._incidentReported = false;
}
  let energyScore = 100;
  let waterScore = 100;

  // ===== FAN Waste Detection =====
  let fanThreshold =
  runtime.learning.thresholds.fanTempLow;

if (runtime.season.current === "SUMMER")
  fanThreshold -= 2;

if (runtime.season.current === "WINTER")
  fanThreshold += 3;

if (actuatorState.fan === "ON" &&
    telemetry.temperature < fanThreshold) {
    energyScore -= 20;

    if (runtime.aiMode.enabled) {
      console.log("[AI AUTO-CORRECT] Turning FAN_OFF", deviceId);

      await dispatchCommand({
        commandId: Date.now().toString(),
        deviceId,
        action: "FAN_OFF",
        issuedAt: new Date().toISOString()
      });
    }
  }

  // ===== PUMP Waste Detection =====
 let soilThreshold =
  runtime.learning.thresholds.pumpSoilHigh;

if (runtime.season.current === "SUMMER")
  soilThreshold -= 5;

if (runtime.season.current === "HUMID")
  soilThreshold += 5;

if (actuatorState.pump === "ON" &&
    telemetry.soil_moisture > soilThreshold) {
    waterScore -= 25;

    if (runtime.aiMode.enabled &&!isEnergyBudgetExceeded()) {
      console.log("[AI AUTO-CORRECT] Turning PUMP_OFF", deviceId);

      await dispatchCommand({
        commandId: Date.now().toString(),
        deviceId,
        action: "PUMP_OFF",
        issuedAt: new Date().toISOString()
      });
    }
  }

  if (energyScore < 0) energyScore = 0;
  if (waterScore < 0) waterScore = 0;

  runtime.optimization.devices[deviceId] = {
    energyScore,
    waterScore,
    at: new Date().toISOString()
  };

  return { energyScore, waterScore };
}

function evaluateFarmOptimization() {

  const devices = runtime.optimization.devices;
  const values = Object.values(devices);

  if (!values.length) return;

  const avgEnergy =
    values.reduce((a, d) => a + d.energyScore, 0) / values.length;

  const avgWater =
    values.reduce((a, d) => a + d.waterScore, 0) / values.length;

  runtime.optimization.farm.energyScore = Math.round(avgEnergy);
  runtime.optimization.farm.waterScore = Math.round(avgWater);
}

module.exports = {
  evaluateDeviceOptimization,
  evaluateFarmOptimization
};