// alerts.api.js
const { runtime } = require("../../store/runtime.store.js");
const { persistent } = require("../../store/persistent.store.js");

const OFFLINE_AFTER_MS = 30_000;

function registerAlertsAPI(app) {
  app.get("/api/dashboard/farm/:farmId/alerts", (req, res) => {
    const farmId = req.params.farmId;
    const now = Date.now();
    const alerts = [];

    // OFFLINE alerts
    Object.values(persistent.devices || {})
      .filter(d => d.farmId === farmId)
      .forEach(d => {
        const rt = runtime.devices?.[d.deviceId];
        if (!rt?.lastSeen) return;

        if (now - new Date(rt.lastSeen).getTime() > OFFLINE_AFTER_MS) {
          alerts.push({
            id: `OFFLINE-${d.deviceId}`,
            type: "critical",
            deviceId: d.deviceId,
            message: `Device ${d.deviceId} is offline`,
            at: new Date().toISOString()
          });
        }
      });

    // FAILED command alerts (last 50)
    const failed =
      (persistent.commandHistory || [])
        .filter(e => e.status === "FAILED")
        .slice(-50)
        .map(e => ({
          id: `CMDFAIL-${e.commandId}`,
          type: "warning",
          deviceId: e.deviceId,
          message: `Command failed: ${e.action}`,
          at: e.at
        }));

    res.json({ farmId, alerts: [...alerts, ...failed] });
  });
}

module.exports = { registerAlertsAPI };
