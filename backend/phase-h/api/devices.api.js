// backend/phase-h/api/devices.api.js

const { runtime } = require("../../store/runtime.store.js");
const { persistent } = require("../../store/persistent.store.js");

function registerDevicesAPI(app) {
  app.get("/api/dashboard/farm/:farmId/devices", (req, res) => {
    const farmId = req.params.farmId;

    const devices = Object.values(persistent.devices || {})
      .filter(d => d.farmId === farmId)
      .map(d => {
        const rt = runtime.devices?.[d.deviceId] || {};
        const tel = runtime.telemetry?.[d.deviceId] || {};

        return {
          deviceId: d.deviceId,
          species: d.species,
          location: d.location,
          status: rt.status || "OFFLINE",
          lastSeen: rt.lastSeen || null,
          telemetry: tel.sensors || {}
        };
      });

    res.json({
      farmId,
      count: devices.length,
      devices
    });
  });
}

module.exports = {
  registerDevicesAPI
};
