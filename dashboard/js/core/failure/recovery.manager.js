// /core/failure/recovery.manager.js

import { auditStore } from "../audit/audit.store.js";

/**
 * device online হলে call করবে
 * @param {string} deviceId
 * @param {Function} executor
 * @param {Array} failedCommands
 */
export function handleDeviceRecovery(deviceId, executor, failedCommands = []) {
  // ওই device-এর command filter
  const recoverable = failedCommands.filter(
    (cmd) => cmd.deviceId === deviceId && cmd.status === "FAILED"
  );

  recoverable.forEach((cmd) => {
    // reset state
    cmd.status = "RECOVERING";
    cmd.retryCount = 0;

    auditStore.add({
      type: "DEVICE_RECOVERY",
      deviceId,
      commandId: cmd.id,
      timestamp: Date.now()
    });

    // আবার execute
    executor(cmd);
  });
}
