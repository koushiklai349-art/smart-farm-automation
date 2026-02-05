/**
 * Normalize backend chaos → single UI truth
 */
export function normalizeCommandState({
  commandStatus,
  outcomeStatus,
  blockedReason
}) {
  // 🔒 block always wins
  if (blockedReason) {
    return "BLOCKED";
  }

  // ✅ outcome beats everything
  if (outcomeStatus === "SUCCESS") {
    return "SUCCESS";
  }

  // ❌ final failure
  if (
    outcomeStatus === "FAILURE" ||
    outcomeStatus === "NO_EFFECT"
  ) {
    return "FAILED";
  }

  // 🔁 running states
  if (
    ["pending", "sent", "SENT", "running"].includes(
      commandStatus
    )
  ) {
    return "RUNNING";
  }

  // ⚪ default
  return "IDLE";
}
