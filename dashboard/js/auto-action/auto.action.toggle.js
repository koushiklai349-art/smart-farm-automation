// dashboard/js/auto-action/auto.action.toggle.js
import { enableAutoAction,disableAutoAction,isAutoActionEnabled} from "../devices/device.autoaction.store.js";
import {getSystemMode,SYSTEM_MODE} from "../recovery/recovery.state.js";
import { showToast } from "../components/ui.toast.js";

/**
 * UI থেকে toggle করলে এইটা কল হবে
 */
export function toggleAutoAction(deviceId) {
  if (!deviceId) return;

  const systemMode = getSystemMode();

  // 🔒 If already enabled → always allow manual OFF
  if (isAutoActionEnabled(deviceId)) {
    disableAutoAction(deviceId);
    showToast("ℹ️ Auto-Action has been disabled", "success");

    return {
      enabled: false,
      reason: "Manually Disabled"
    };
  }

  // 🛑 Trying to enable but system not stable
  if (systemMode !== SYSTEM_MODE.STABLE) {
    let reason = "System Not Stable";

    if (systemMode === SYSTEM_MODE.DEGRADED) {
      reason = "System Degraded";
    } else if (systemMode === SYSTEM_MODE.RECOVERING) {
      reason = "Recovery Running";
    } else if (systemMode === SYSTEM_MODE.CRITICAL) {
      reason = "Critical System State";
    }
    showToast(`⚠️ Auto-Action cannot be enabled: ${reason}`);

    return {
      enabled: false,
      blocked: true,
      reason
    };
  }

  // ✅ System stable → allow enable
  enableAutoAction(deviceId);
  return {
    enabled: true,
    reason: "System Stable"
  };
}

/**
 * Explicit set (future use)
 */
export function setAutoAction(deviceId, enabled) {
  if (!deviceId) return;

  const systemMode = getSystemMode();

  if (enabled) {
    if (systemMode !== SYSTEM_MODE.STABLE) {
      return {
        enabled: false,
        blocked: true,
        reason: "System Not Stable"
      };
    }
    enableAutoAction(deviceId);
    return { enabled: true };
  }

  disableAutoAction(deviceId);
  return { enabled: false };
}
