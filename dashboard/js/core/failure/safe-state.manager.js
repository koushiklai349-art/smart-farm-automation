// /core/failure/safe-state.manager.js

import { auditStore } from "../../audit/audit.store.js";


/**
 * failure হলে safe action নেবে
 * @param {Object} cmd
 * @param {Function} sendSafeCommand
 */
export function applySafeState(cmd, sendSafeCommand) {
  if (!cmd || !cmd.deviceId) return;

  // example: relay / motor off
  const safeCmd = {
    id: `SAFE_${cmd.id}`,
    deviceId: cmd.deviceId,
    action: "OFF",
    reason: "FAILURE_SAFE_STATE"
  };

  auditStore.add({
    type: "SAFE_STATE_APPLIED",
    deviceId: cmd.deviceId,
    originalCommandId: cmd.id,
    timestamp: Date.now()
  });

  // send safe command
  sendSafeCommand(safeCmd);
}
export function enterSafeState(cmd, sendSafeCommand) {
  applySafeState(cmd, sendSafeCommand);
}