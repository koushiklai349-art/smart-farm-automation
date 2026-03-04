const Schedule = require("../models/schedule.model");
const { evaluateSchedulesAdapter } = require("../phase-g/adapter/schedule.engine.adapter");
const Command = require("../models/command.model");
const { processCommand } = require("./command.orchestrator.service");
const { canExecuteEnergyAware } = require("./energy.guard.service");
const { isMaintenanceActive } = require("./maintenance.service");
const { DateTime } = require("luxon");
const Farm = require("../models/farm.model");

async function getFarmTime(farmId) {
  const farm = await Farm.findById(farmId);
  const tz = farm?.timezone || "UTC";

  const now = DateTime.now().setZone(tz);

  return {
    now,
    timeString: now.toFormat("HH:mm"),
    minuteKey: now.toFormat("yyyy-MM-dd HH:mm"),
    weekday: now.weekday % 7 // luxon: 1=Mon..7=Sun → convert
  };
}

async function runScheduleEngine() {
  if (isMaintenanceActive()) {
  console.log("🛠 Maintenance Mode Active → Schedule paused");
  return;
}
  const schedules = await Schedule.find({ enabled: true });
  const conflictMap = {};

  for (const schedule of schedules) {

    const { timeString, minuteKey, weekday } =
      await getFarmTime(schedule.farmId);

    if (!schedule.daysOfWeek.includes(weekday)) continue;

    if (schedule.time !== timeString) continue;

    if (schedule.lastExecutedAt === minuteKey) continue;

    const { target, value } = schedule.action;

    // 🔥 Conflict Protection
    const key = `${schedule.deviceId}-${target}-${minuteKey}`;

    if (conflictMap[key] && conflictMap[key] !== value) {
      console.log("🔥 Schedule conflict detected:", key);
      continue;
    }

    conflictMap[key] = value;

    const commandId =
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2);

    const payload = {
      target,
      operation: value
    };
    if (!canExecuteEnergyAware(schedule.deviceId)) {
     console.log(
        "⚡ Energy limit exceeded → Schedule blocked"
      );
    continue;
   }
    const command = await Command.create({
      deviceId: schedule.deviceId,
      commandId,
      payload,
      source: "SCHEDULE",
      status: "pending",
      retryCount: 0,
      maxRetries: 3
    });

    const result = await processCommand({
      deviceId: schedule.deviceId,
      commandId,
      payload,
      source: "SCHEDULE"
    });

    if (result.status === "ALLOWED") {
      command.status = "allowed";
      await command.save();

      // 🔥 VERY IMPORTANT — dispatch to device
      const { sendToDevice } =
        require("../phase-b/integration/device.bridge");

      await sendToDevice({
        deviceId: schedule.deviceId,
        commandId,
        payload
      });

      command.status = "sent";
      await command.save();
    }

    schedule.lastExecutedAt = minuteKey;
    await schedule.save();
  }
}

module.exports = {
  runScheduleEngine
};