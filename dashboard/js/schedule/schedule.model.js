// schedule/schedule.model.js
export function createSchedule({
  id,
  deviceId,
  action,
  type,        // "once" | "interval"
  at,          // timestamp (for once)
  every,       // ms (for interval)
  enabled = true
}) {
  return {
    id,
    deviceId,
    action,
    type,
    at,
    every,
    enabled,
    lastRun: null
  };
}
