// backend/phase-h/api/farm.snapshot.api.js

const { runtime } = require("../../store/runtime.store.js");
const { persistent } = require("../../store/persistent.store.js");

function registerFarmSnapshotAPI(app) {
  app.get("/api/dashboard/farm/:farmId/snapshot", (req, res) => {
    const farmId = req.params.farmId;

    const devices = Object.values(persistent.devices || {})
      .filter(d => d.farmId === farmId)
      .map(d => {
        const rt = runtime.devices?.[d.deviceId] || {};
        const tel = runtime.telemetry?.[d.deviceId] || {};

        return {
          deviceId: d.deviceId,
          species: d.species,
          status: rt.status || "OFFLINE",
          lastSeen: rt.lastSeen || null,
          telemetry: tel.sensors || {}
        };
      });

    res.json({
      farmId,
      devices,
      generatedAt: new Date().toISOString()
    });
  });
}

module.exports = {
  registerFarmSnapshotAPI
};
