// services/heartbeat.service.js

const ControllerInstance = require("../models/controllerInstance.model");
const alertService = require("./alert.service");
const { attemptRecovery } = require("./recovery.engine");

const HEARTBEAT_TIMEOUT_MS = 20000;

function calculateSeverity(lastHeartbeat) {
  const diffMs = Date.now() - new Date(lastHeartbeat).getTime();
  const minutes = diffMs / 60000;

  if (minutes >= 5) return "CRITICAL";
  if (minutes >= 1) return "HIGH";
  return "MEDIUM";
}

class HeartbeatService {

  async recordHeartbeat(deviceId) {
    const controller = await ControllerInstance.findOne({ deviceId });

    if (!controller) {
      throw new Error("Controller not found");
    }

    controller.lastHeartbeat = new Date();
    controller.status = "online";

    // Improve health gradually
    if (controller.healthScore < 100) {
      controller.healthScore += 2;
      if (controller.healthScore > 100) controller.healthScore = 100;
    }

    await controller.save();
    return controller;
  }

 async markOfflineStaleControllers() {
  const threshold = new Date(Date.now() - HEARTBEAT_TIMEOUT_MS);

  const staleControllers = await ControllerInstance.find({
    status: "online",
    lastHeartbeat: { $lt: threshold }
  });

  for (const controller of staleControllers) {

    controller.status = "offline";
    await attemptRecovery(controller.deviceId);
    controller.offlineCount += 1;

    controller.healthScore -= 20;
    if (controller.healthScore < 0) controller.healthScore = 0;

    const severity = calculateSeverity(controller.lastHeartbeat);

    await alertService.createAlert({
      type: "CONTROLLER_OFFLINE",
      deviceId: controller.deviceId,
      severity,
      message: `Controller ${controller.deviceId} offline (${severity})`
    });

    await controller.save();

    console.log(
      `⚠️ Auto marked offline: ${controller.deviceId} → ${severity}`
    );
  }

  return staleControllers.length;
}
}

module.exports = new HeartbeatService();