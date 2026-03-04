const { runtime } = require("../store/runtime.store");

exports.getDeviceRisk = (req, res) => {

  const { deviceId } = req.params;

  const healthScore = runtime.health.devices?.[deviceId];

  if (healthScore === undefined) {
    return res.status(404).json({ error: "DEVICE_NOT_FOUND" });
  }

  const riskScore = 100 - healthScore;

  res.json({
    deviceId,
    healthScore,
    riskScore,
    level: getRiskLevel(riskScore)
  });
};

exports.getFarmRisk = (req, res) => {

  const devices = runtime.health.devices || {};

  const result = Object.entries(devices).map(([deviceId, healthScore]) => {

    const riskScore = 100 - healthScore;

    return {
      deviceId,
      healthScore,
      riskScore,
      level: getRiskLevel(riskScore)
    };
  });

  res.json({
    totalDevices: result.length,
    devices: result
  });
};

function getRiskLevel(riskScore) {

  if (riskScore >= 95) return "CRITICAL";
  if (riskScore >= 85) return "HIGH";
  if (riskScore >= 75) return "ELEVATED";
  if (riskScore >= 60) return "WARNING";
  return "NORMAL";
}