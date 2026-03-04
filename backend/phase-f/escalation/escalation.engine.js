const { runtime } = require("../../store/runtime.store");

async function evaluateEscalation(deviceId, dispatchCommand) {

  const risk = runtime.predictive.devices?.[deviceId];
  if (risk === undefined) return;

  runtime.escalation.devices =
    runtime.escalation.devices || {};

  const current =
    runtime.escalation.devices[deviceId] || {
      level: 0,
      lastEscalatedAt: 0
    };

  let newLevel = 0;

  if (risk > 95) newLevel = 4;
  else if (risk > 90) newLevel = 3;
  else if (risk > 80) newLevel = 2;
  else if (risk > 70) newLevel = 1;

  if (newLevel <= current.level) return;

  runtime.escalation.devices[deviceId] = {
    level: newLevel,
    lastEscalatedAt: Date.now()
  };

  console.log(
    "[ESCALATION]",
    deviceId,
    "Level →",
    newLevel
  );

  runtime.alerts.push({
    type: "ESCALATION",
    deviceId,
    level: newLevel,
    at: new Date().toISOString()
  });

  // Auto action by level
  if (newLevel >= 3) {

    await dispatchCommand({
      commandId: Date.now().toString(),
      deviceId,
      action: "FAN_ON",
      issuedAt: new Date().toISOString()
    });
  }

  if (newLevel >= 4) {

    await dispatchCommand({
      commandId: Date.now().toString(),
      deviceId,
      action: "PUMP_OFF",
      issuedAt: new Date().toISOString()
    });
  }
}

module.exports = {
  evaluateEscalation
};