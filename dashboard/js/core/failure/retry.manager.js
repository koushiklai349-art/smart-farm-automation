// /core/failure/retry.manager.js

import { auditStore } from "../audit/audit.store.js";
import { getRetryDelay, DEFAULT_RETRY_POLICY } from "./retry.policy.js";

export function handleRetry(cmd, executor, policy = DEFAULT_RETRY_POLICY) {
  // retryCount না থাকলে 0 দিয়ে শুরু
  cmd.retryCount = cmd.retryCount || 0;

  // max retry ছাড়িয়ে গেলে hard fail
  if (cmd.retryCount >= policy.maxRetry) {
    markHardFail(cmd);
    return;
  }

  cmd.retryCount += 1;
  const delay = getRetryDelay(cmd.retryCount, policy);

  // retry log
  auditStore.add({
    type: "COMMAND_RETRY",
    commandId: cmd.id,
    deviceId: cmd.deviceId,
    retryCount: cmd.retryCount,
    delay,
    timestamp: Date.now()
  });

  // delay পরে আবার execute
  setTimeout(() => {
    executor(cmd);
  }, delay);
}

function markHardFail(cmd) {
  cmd.status = "FAILED";

  auditStore.add({
    type: "COMMAND_HARD_FAIL",
    commandId: cmd.id,
    deviceId: cmd.deviceId,
    retries: cmd.retryCount,
    timestamp: Date.now()
  });
}
