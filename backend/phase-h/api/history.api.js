// history.api.js
const { persistent } = require("../../store/persistent.store.js");

function registerHistoryAPI(app) {
  app.get("/api/dashboard/farm/:farmId/history", (req, res) => {
    const farmId = req.params.farmId;

    const events = (persistent.commandHistory || [])
      .filter(e => {
        const dev = persistent.devices?.[e.deviceId];
        return dev?.farmId === farmId;
      })
      .slice(-50)
      .reverse();

    res.json({ farmId, events });
  });
}

module.exports = { registerHistoryAPI };
