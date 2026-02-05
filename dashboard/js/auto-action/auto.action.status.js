import { isAutoActionEnabled } from "../devices/device.autoaction.store.js";
import { getSystemMode, SYSTEM_MODE } from "../recovery/recovery.state.js";
import { getLastAutoActionBlock } from "../audit/auto.action.audit.selector.js";

export function getAutoActionStatus(deviceId) {
  const enabled = isAutoActionEnabled(deviceId);
  const systemMode = getSystemMode();

  // 🔮 TASK-121: predictive block reason
  const lastBlock = getLastAutoActionBlock(deviceId);

  if (lastBlock?.reason === "PREDICTED_CRITICAL_RISK") {
    return {
      enabled: false,
      label: "🔒 AUTO PAUSED",
      reason: "System likely to become CRITICAL soon",
      meta: lastBlock.meta
    };
  }

  if (lastBlock?.reason === "PREDICTED_DEGRADATION_RISK") {
    return {
      enabled: false,
      label: "⏸ AUTO PAUSED",
      reason: "System stability trending downward",
      meta: lastBlock.meta
    };
  }

  // ✅ EXISTING system-mode logic (REAL CODE)
  if (systemMode !== SYSTEM_MODE.STABLE) {
    switch (systemMode) {
      case SYSTEM_MODE.DEGRADED:
        return {
          enabled: false,
          label: "🟡 AUTO PAUSED",
          reason: "System Degraded"
        };

      case SYSTEM_MODE.RECOVERING:
        return {
          enabled: false,
          label: "🔵 AUTO PAUSED",
          reason: "Recovery Running"
        };

      case SYSTEM_MODE.CRITICAL:
        return {
          enabled: false,
          label: "🔴 AUTO BLOCKED",
          reason: "Critical System State"
        };
    }
  }

  // 👤 Manual toggle case
  if (!enabled) {
    return {
      enabled: false,
      label: "AUTO OFF",
      reason: "Manual Disabled"
    };
  }

  // ✅ Fully allowed
  return {
    enabled: true,
    label: "🟢 AUTO ON",
    reason: "System Stable"
  };
}
