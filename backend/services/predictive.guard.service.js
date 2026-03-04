const Command = require("../models/command.model");
const { processCommand } = require("./command.orchestrator.service");
const { sendToDevice } = require("../phase-b/integration/device.bridge");
const alertService = require("./alert.service");
 const { runtime } = require("../store/runtime.store");
const { ensureFarmScope } = require("../store/runtime.store");
const incidentService = require("./incident.service");
const recoveryService = require("./recovery.service");

const escalationMap = {};
const ESCALATION_TIME_MS = 5 * 60 * 1000; // 5 minutes
const cooldownMap = {};
const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes
const RISK_THRESHOLD = 75;

async function evaluateRisk(deviceId, riskScore) {

  let action = null;
const farmId = runtime.devices?.[deviceId]?.farmId;
const farmScope = ensureFarmScope(farmId);

if (riskScore >= 95) {
farmScope.lockedDevices[deviceId] = { 
  lockedAt: new Date(),
  reason: "CRITICAL_RISK"
};

console.log("🔒 Device LOCKED:", deviceId);

  action = { target: "motor", operation: "LOCK" };
} 
else if (riskScore >= 85) {

  action = { target: "motor", operation: "OFF" };

  await incidentService.createIncident({
    type: "DEVICE_RISK",
    deviceId,
    severity: "high",
    message: `Risk score exceeded safe threshold (${riskScore})`
  });

}
else if (riskScore >= 75) {
  action = { target: "motor", operation: "REDUCE" };
} 
else if (riskScore >= 60) {
  console.log("⚠️ Moderate risk detected — warning only");
  return;
}
else {

  incidentService.resolveIncident(
    deviceId,
    "DEVICE_RISK"
  );

  return;
}
// 🚨 Escalation tracking
if (riskScore >= 85) {

  if (!escalationMap[deviceId]) {
    escalationMap[deviceId] = Date.now();
  }

  const duration = Date.now() - escalationMap[deviceId];

 if (duration >= ESCALATION_TIME_MS) {

  console.log("🚨 Escalation triggered for", deviceId);

  await alertService.createAlert({
    type: "CRITICAL_RISK",
    deviceId,
    severity: "critical",
    message: `Risk persisted above 85 for 5 minutes`
  });

  await incidentService.escalateIncident(
    deviceId,
    "DEVICE_RISK"
  );
  await recoveryService.attemptRecovery(deviceId);
  escalationMap[deviceId] = Date.now();
}
} else {
  // reset if risk drops
  delete escalationMap[deviceId];
}
  // 🔒 Cooldown protection
const actionKey = `${deviceId}-${action.target}-${action.operation}`;
const lastTriggered = cooldownMap[actionKey];

if (lastTriggered && Date.now() - lastTriggered < COOLDOWN_MS) {
  console.log("⏳ Cooldown active — skipping preventive action");
  return;
}

  console.log(`⚠️ High risk detected on ${deviceId}: ${riskScore}`);

  const commandId =
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2);

  const payload = {
  target: action.target,
  operation: action.operation
};

  const command = await Command.create({
    deviceId,
    commandId,
    payload,
    source: "AI",
    status: "pending",
    retryCount: 0,
    maxRetries: 3,
    issuedBy: "SYSTEM",
    issuedByRole: "AI",
    issuedAt: new Date()
  });

  const result = await processCommand({
    deviceId,
    commandId,
    payload,
    source: "AI"
  });

  if (result.status === "ALLOWED") {
    command.status = "allowed";
    await command.save();

    await sendToDevice({
      deviceId,
      commandId,
      payload
    });

    command.status = "sent";
    await command.save();
    cooldownMap[actionKey] = Date.now();
  }
}

module.exports = {
  evaluateRisk
};