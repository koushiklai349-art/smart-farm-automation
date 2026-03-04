const ControllerInstance = require("../models/controllerInstance.model");

async function resolveActiveController(deviceId) {

  const primary = await ControllerInstance.findOne({
    deviceId,
    role: "PRIMARY"
  });

  if (primary && primary.status === "online") {
    return primary.deviceId;
  }

  const backup = await ControllerInstance.findOne({
    role: "BACKUP",
    lineId: primary?.lineId
  });

  if (backup && backup.status === "online") {
    console.log("🔁 Failover → Using BACKUP:", backup.deviceId);
    return backup.deviceId;
  }

  return null;
}

module.exports = {
  resolveActiveController
};