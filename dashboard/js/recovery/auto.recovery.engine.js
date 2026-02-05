import { auditStore } from "../audit/audit.store.js";
import { getSystemHealthScore } from "../health/system.health.js";
import { getFailures } from "./failure.counter.js";
import {
  quarantineDevice,
  isQuarantined,
  releaseFromQuarantine
} from "./device.quarantine.js";


// 🔒 TASK-65: auto-release config
const RELEASE_HEALTH_THRESHOLD = 60;
const MAX_FAILURES_FOR_RELEASE = 1;
const MIN_QUARANTINE_MS = 2 * 60 * 1000; // 2 minutes

let retryTimer = null;
let attempt = 0;
const MAX_ATTEMPT = 3;

export function startAutoRecovery(checkFn, onSuccess) {
  if (retryTimer) return; // already running

  attempt = 0;

  retryTimer = setInterval(() => {
    attempt++;

    auditStore.add({
      type: "AUTO_RECOVERY_ATTEMPT",
      level: "INFO",
      attempt,
      timestamp: Date.now()
    });

    const ok = checkFn();

    if (ok) {
      stopAutoRecovery();

      auditStore.add({
        type: "AUTO_RECOVERY_SUCCESS",
        level: "INFO",
        timestamp: Date.now()
      });

      onSuccess();
    }

    if (attempt >= MAX_ATTEMPT) {
      stopAutoRecovery();

      auditStore.add({
        type: "AUTO_RECOVERY_FAILED",
        level: "WARN",
        timestamp: Date.now()
      });
    }
  }, 5000); // every 5s
}

export function stopAutoRecovery() {
  if (retryTimer) {
    clearInterval(retryTimer);
    retryTimer = null;
  }
}

// 🔒 TASK-64: auto quarantine escalation on critical health
export function autoQuarantineOnCriticalHealth(deviceIds = []) {
  const health = getSystemHealthScore();

  // only escalate on very bad health
  if (health > 25) return;

  deviceIds.forEach((deviceId) => {
    const failures = getFailures(deviceId);

    if (failures >= 3) {
      quarantineDevice(deviceId, {
        reason: "auto_quarantine_low_health",
        healthScore: health,
        failures
      });
       metricsStore.inc("auto_quarantine");
      auditStore.add({
        type: "AUTO_QUARANTINE",
        level: "WARN",
        deviceId,
        failures,
        healthScore: health,
        timestamp: Date.now()
      });
    }
  });
}
// 🔓 TASK-65: auto release from quarantine
export function autoReleaseFromQuarantine(deviceIds = []) {
  const health = getSystemHealthScore();

  // system not healthy enough
  if (health < RELEASE_HEALTH_THRESHOLD) return;

  const now = Date.now();

  deviceIds.forEach((deviceId) => {
    if (!isQuarantined(deviceId)) return;

    const failures = getFailures(deviceId);

    // still failing
    if (failures > MAX_FAILURES_FOR_RELEASE) return;

    // optional: respect minimum quarantine time
    const qInfo = isQuarantined(deviceId, true); 
    // assume extended info { since }

    if (qInfo?.since && now - qInfo.since < MIN_QUARANTINE_MS) {
      return;
    }

    releaseFromQuarantine(deviceId, {
      reason: "auto_recovery",
      healthScore: health,
      failures
    });
   metricsStore.inc("auto_release");

  });
}
