// services/heartbeat.api.js

const heartbeatService = require("./heartbeat.service");

module.exports = async function heartbeat(req, res) {
  const { deviceId } = req.body;

  if (!deviceId) {
    return res.status(400).json({ error: "deviceId required" });
  }

  try {
    const controller = await heartbeatService.recordHeartbeat(deviceId);
    res.json({ ok: true, status: controller.status });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};