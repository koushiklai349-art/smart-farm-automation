// backend/phase-g/adapter/schedule.engine.adapter.js

/**
 * Converts schedules into command intents.
 * NO IO
 * NO DISPATCH
 * NO STORE WRITE
 */

function evaluateSchedulesAdapter({
  schedules = [],
  nowTime,
  actuatorState = {},
  overrideMode = {}
}) {
  const decisions = [];

  schedules.forEach(schedule => {
    if (!schedule.enabled) return;
    if (schedule.time !== nowTime) return;

    const deviceId = schedule.deviceId;
    const { target, value } = schedule.action;

    const override =
      overrideMode?.[deviceId]?.[target] || "AUTO";

    if (override === "FORCE_OFF" && value === "ON") return;
    if (override === "FORCE_ON" && value === "OFF") return;

    const current =
      actuatorState?.[deviceId]?.[target];

    if (current === value) return;

    decisions.push({
      deviceId,
      target,
      value,
      reason: "SCHEDULE"
    });
  });

  return decisions;
}

module.exports = {
  evaluateSchedulesAdapter
};
