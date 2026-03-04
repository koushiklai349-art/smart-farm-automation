function evaluateSeverity({ type, details }) {

  switch (type) {

    case "HEALTH_CRITICAL":
      if (details.healthScore < 20)
        return "CRITICAL";
      return "HIGH";

    case "PREDICTIVE_RISK":
      if (details.riskScore > 90)
        return "HIGH";
      return "MEDIUM";

    case "ENERGY_BUDGET_EXCEEDED":
      return "MEDIUM";

    case "MAINTENANCE_REQUIRED":
      return "LOW";

    case "ESCALATION":
      if (details.level >= 3)
        return "CRITICAL";
      return "HIGH";
    
    case "FAILOVER_ACTIVATED":
      return "HIGH";

    case "FAILOVER_NO_BACKUP":
      return "CRITICAL";
      
    default:
      return "LOW";
  }
}

module.exports = {
  evaluateSeverity
};