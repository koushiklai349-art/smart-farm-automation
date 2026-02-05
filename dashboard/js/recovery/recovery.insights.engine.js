/**
 * TASK-142.1
 * Recovery Insights Engine
 *
 * Input:
 *  - incidents (from correlateRecoveryIncidents)
 *
 * Output:
 *  {
 *    total,
 *    open,
 *    closed,
 *    avgRecoveryMs,
 *    avgRetries,
 *    slaBreachRate,
 *    topFailingDevices
 *  }
 */

export function buildRecoveryInsights(incidents = []) {
  if (!Array.isArray(incidents) || incidents.length === 0) {
    return emptyInsights();
  }

  let total = incidents.length;
  let open = 0;
  let closed = 0;

  let recoverySum = 0;
  let recoveryCount = 0;

  let retrySum = 0;

  let slaBreaches = 0;
  let totalSlaChecks = 0;

  const failureByDevice = {};

  for (const inc of incidents) {
    if (inc.status === "OPEN") open++;
    else closed++;

    // retries
    retrySum += inc.retryCount || 0;

    // recovery duration
    if (typeof inc.durationMs === "number") {
      recoverySum += inc.durationMs;
      recoveryCount++;
    }

    // SLA breach detection (inside incident events)
    if (Array.isArray(inc.events)) {
      for (const e of inc.events) {
        if (e.type === "SLA_BREACH") {
          slaBreaches++;
        }
        if (e.type === "RECOVERED") {
          totalSlaChecks++;
        }
        if (e.type === "FAILURE") {
          const d = inc.deviceId || "UNKNOWN";
          failureByDevice[d] = (failureByDevice[d] || 0) + 1;
        }
      }
    }
  }

  const avgRecoveryMs =
    recoveryCount > 0 ? Math.round(recoverySum / recoveryCount) : 0;

  const avgRetries =
    total > 0 ? Math.round(retrySum / total) : 0;

  const slaBreachRate =
    totalSlaChecks > 0
      ? Math.round((slaBreaches / totalSlaChecks) * 100)
      : 0;

  const topFailingDevices = Object.entries(failureByDevice)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([deviceId, count]) => ({ deviceId, count }));

  return {
    total,
    open,
    closed,
    avgRecoveryMs,
    avgRetries,
    slaBreachRate,
    topFailingDevices
  };
}

function emptyInsights() {
  return {
    total: 0,
    open: 0,
    closed: 0,
    avgRecoveryMs: 0,
    avgRetries: 0,
    slaBreachRate: 0,
    topFailingDevices: []
  };
}
