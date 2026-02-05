import { auditStore } from "../audit/audit.store.js";
import {
  resolvePlaybookOutcome
} from "./playbook/recovery.playbook.outcome.store.js";
const quarantined = new Set();

export function quarantineDevice(deviceId) {
  quarantined.add(deviceId);
  console.warn("🚫 Device quarantined:", deviceId);

  auditStore.log({
    type: "QUARANTINED",
    deviceId,
    source: "RECOVERY"
  });

  resolvePlaybookOutcome({
  action: "QUARANTINE_DEVICE",
  deviceId,
  status: "NO_EFFECT",
  meta: { reason: "Device quarantined by playbook" }
});

}

export function releaseDevice(deviceId) {
  quarantined.delete(deviceId);
  console.info("✅ Device released:", deviceId);

  auditStore.log({
    type: "MANUAL_RELEASE",
    deviceId,
    source: "RECOVERY"
  });

   resolvePlaybookOutcome({
    action: "RELEASE_DEVICE",
    deviceId,
    status: "SUCCESS",
    meta: { reason: "Device released from quarantine" }
  });
}

export function isQuarantined(deviceId) {
  return quarantined.has(deviceId);
}

export function releaseFromQuarantine(deviceId, meta = {}) {
  if (!quarantined.has(deviceId)) return false;

  quarantined.delete(deviceId);

  auditStore.log({
    type: "MANUAL_RELEASE",
    deviceId,
    source: "RECOVERY",
    meta
  });

  resolvePlaybookOutcome({
  action: "RELEASE_DEVICE",
  deviceId,
  status: "SUCCESS",
  meta
});

  return true;
}

// ✅ alias export for auto-action guard compatibility
export function isDeviceQuarantined(deviceId) {
  return isQuarantined(deviceId);
}

