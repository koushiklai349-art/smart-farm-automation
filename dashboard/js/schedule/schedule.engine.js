// dashboard/js/schedule/schedule.engine.js

import { scheduleStore } from "./schedule.store.js";
import { dispatchCommand } from "../command/command.dispatcher.js";
import { createCommand } from "../command/command.factory.js";


function getCurrentHHMM() {
  const now = new Date();
  return now.toTimeString().slice(0, 5); // "HH:MM"
}

function shouldRunDaily(schedule, nowHHMM) {
  if (schedule.time !== nowHHMM) return false;

  if (!schedule.lastRunAt) return true;

  const last = new Date(schedule.lastRunAt);
  const today = new Date();

  return last.toDateString() !== today.toDateString();
}

function shouldRunInterval(schedule, now) {
  if (!schedule.lastRunAt) return true;

  const diffMin = (now - schedule.lastRunAt) / 60000;
  return diffMin >= schedule.intervalMin;
}

/**
 * Start schedule engine
 */
let scheduleTimer = null;
export function startScheduleEngine() {
    if (scheduleTimer) return;

   scheduleTimer = setInterval(() => {
    const now = Date.now()
    const nowHHMM = getCurrentHHMM();

    const schedules = scheduleStore.getActive();

    schedules.forEach(schedule => {
      let shouldRun = false;

      if (schedule.type === "daily") {
        shouldRun = shouldRunDaily(schedule, nowHHMM);
      }

      if (schedule.type === "interval") {
        shouldRun = shouldRunInterval(schedule, now);
      }

      if (!shouldRun) return;

      // ✅ REAL command dispatch (TASK-25 pipeline)
      const cmd = createCommand(
      schedule.deviceId,
      schedule.action,
      "schedule"
      );

      dispatchCommand(cmd);

      scheduleStore.markRun(schedule.id);
    });
  }, 30000); // every 30 seconds
}
export function stopScheduleEngine() {
  clearInterval(scheduleTimer);
  scheduleTimer = null;
}