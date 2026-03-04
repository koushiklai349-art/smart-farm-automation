const { runtime } = require("../../store/runtime.store");

function evaluateMaintenance(deviceId) {

  const risk = runtime.predictive.devices?.[deviceId] ?? 0;
  const escalationLevel =
    runtime.escalation.devices?.[deviceId]?.level ?? 0;
  const health =
    runtime.health.devices?.[deviceId] ?? 100;

  let recommend = false;
  let reason = [];

  if (risk > 80) {
    recommend = true;
    reason.push("High predictive risk");
  }

  if (escalationLevel >= 3) {
    recommend = true;
    reason.push("High escalation level");
  }

  if (health < 50) {
    recommend = true;
    reason.push("Low health score");
  }

  if (recommend) {

    runtime.maintenance.devices[deviceId] = {
      recommended: true,
      reason,
      at: new Date().toISOString()
    };

    runtime.alerts.push({
      type: "MAINTENANCE_REQUIRED",
      deviceId,
      reason,
      at: new Date().toISOString()
    });

    console.log(
      "[MAINTENANCE RECOMMENDED]",
      deviceId,
      reason
    );
  }
}

module.exports = {
  evaluateMaintenance
};