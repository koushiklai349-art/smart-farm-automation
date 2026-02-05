import { getFailures } from "../recovery/failure.counter.js";
import { isQuarantined } from "../recovery/device.quarantine.js";

export function calculateHealthScore(devices = [], currentHealth = "ok") {
  let score = 100;

  devices.forEach(deviceId => {
    const failures = getFailures(deviceId);
    if (failures > 0) score -= failures * 10;
    if (isQuarantined(deviceId)) score -= 20;
  });

  if (currentHealth === "critical") score -= 30;

  return Math.max(0, Math.min(100, score));
}

// ✅ alias export for auto-action context
export function getHealthScore(deviceId) {
  // existing engine expects list of devices
  return calculateHealthScore([deviceId]);
}
