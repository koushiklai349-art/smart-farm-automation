import { getAuditHistory } from "../audit/audit.history.js";

/**
 * Analyze impact of operator override between time window
 */
export function analyzeOverrideImpact(startTs, endTs) {
  const logs = getAuditHistory();

  const actions = logs.filter(
    e =>
      e.type === "AUTO_ACTION" &&
      e.time >= startTs &&
      e.time <= endTs
  );

  const summary = {
    totalActions: actions.length,
    successCount: 0,
    failureCount: 0,
    failureRate: 0,
    devicesTouched: new Set()
  };

  actions.forEach(a => {
    if (a.status === "SUCCESS") summary.successCount++;
    if (a.status === "FAILED") summary.failureCount++;
    if (a.deviceId) summary.devicesTouched.add(a.deviceId);
  });

  summary.failureRate =
    summary.totalActions > 0
      ? Math.round(
          (summary.failureCount / summary.totalActions) * 100
        )
      : 0;

  summary.devicesTouched = Array.from(summary.devicesTouched);

  return summary;
}
