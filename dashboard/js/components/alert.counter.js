export function getAlertCounts(alerts) {
  return {
    critical: alerts.filter(a => a.severity === "critical").length,
    warning: alerts.filter(a => a.severity === "warning").length
  };
}

