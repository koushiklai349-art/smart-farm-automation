import { notifyUI } from "../store/store.notifier.js";
import { save, load } from "../utils/persist.js";

const schedules = new Map(
  load("schedule.list", []).map(s => [s.id, s])
);

export const scheduleStore = {
  add(schedule) {
    const s = {
      id: schedule.id || crypto.randomUUID(),
      deviceId: schedule.deviceId,
      action: schedule.action,
      type: schedule.type,
      time: schedule.time,
      intervalMin: schedule.intervalMin,
      enabled: schedule.enabled !== false,
      createdAt: Date.now(),
      lastRunAt: null
    };

    schedules.set(s.id, s);
    save("schedule.list", Array.from(schedules.values()));
    notifyUI();
  },

  update(id, patch) {
    const s = schedules.get(id);
    if (!s) return;

    Object.assign(s, patch);
    save("schedule.list", Array.from(schedules.values()));
    notifyUI();
  },

  getAll() {
    return Array.from(schedules.values());
  },

  getActive() {
    return Array.from(schedules.values()).filter(s => s.enabled);
  },

  markRun(id) {
    const s = schedules.get(id);
    if (s) {
      s.lastRunAt = Date.now();
      save("schedule.list", Array.from(schedules.values()));
    }
  }
};
