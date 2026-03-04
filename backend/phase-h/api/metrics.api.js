// backend/phase-h/api/metrics.api.js

const { runtime } = require("../../store/runtime.store.js");
const { persistent } = require("../../store/persistent.store.js");

function registerMetricsAPI(app) {
  app.get("/api/dashboard/farm/:farmId/metrics", (req, res) => {
    const farmId = req.params.farmId;

    let online = 0;
    let offline = 0;
    let telemetryActive = 0;

    Object.values(persistent.devices || {})
      .filter(d => d.farmId === farmId)
      .forEach(d => {
        const rt = runtime.devices?.[d.deviceId];
        const tel = runtime.telemetry?.[d.deviceId];

        if (rt?.status === "ONLINE") online++;
        else offline++;

        if (tel?.sensors) telemetryActive++;
      });

    res.json({
      farmId,
      devices: {
        online,
        offline,
        total: online + offline
      },
      telemetry: {
        active: telemetryActive
      },
      generatedAt: new Date().toISOString()
    });
  });
}

module.exports = {
  registerMetricsAPI
};
