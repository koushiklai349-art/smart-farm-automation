const { runtime } = require("../../store/runtime.store");

function generateIncidentSummary(incident) {

  const {
    type,
    severity,
    deviceId,
    details,
    season,
    energyUsage
  } = incident;

  let summary = `${severity}: `;

  switch (type) {

    case "HEALTH_CRITICAL":
      summary += `Device ${deviceId} health dropped to ${details.healthScore}%. `;
      summary += "Protective action triggered.";
      break;

    case "PREDICTIVE_RISK":
      summary += `Predictive risk score reached ${details.riskScore}. `;
      summary += "Preventive monitoring recommended.";
      break;

    case "ENERGY_BUDGET_EXCEEDED":
      summary += `Energy usage exceeded daily budget (${energyUsage}). `;
      summary += "Optimization mode activated.";
      break;

    case "MAINTENANCE_REQUIRED":
      summary += `Maintenance required for device ${deviceId}.`;
      break;

    case "ESCALATION":
      summary += `Incident escalated to level ${details.level}.`;
      break;
    
    case "FAILOVER_ACTIVATED":
      summary += `Failover activated. Backup device ${details.backupDevice} replaced ${details.failedDevice}.`;
      break;

    case "FAILOVER_NO_BACKUP":
       summary += `Device ${deviceId} failed and no backup was available.`;
       break;

    default:
      summary += `Incident occurred on device ${deviceId}.`;
  }

  if (season)
    summary += ` Current season: ${season}.`;

  return summary;
}

module.exports = {
  generateIncidentSummary
};