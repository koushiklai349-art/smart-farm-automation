export function getAlertCounts(alerts) {
  return {
    critical: alerts.filter(a => a.type === "critical").length,
    warning: alerts.filter(a => a.type === "warning").length
  };
}


