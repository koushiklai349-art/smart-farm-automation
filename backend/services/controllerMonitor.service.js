// services/controllerMonitor.service.js

const heartbeatService = require("./heartbeat.service");

const CHECK_INTERVAL_MS = 5000; // check every 5 seconds

const startControllerMonitor = () => {

  setInterval(async () => {
    try {
      const count = await heartbeatService.markOfflineStaleControllers();

      if (count > 0) {
        console.log(`⚠️ Auto-offlined ${count} controller(s)`);
      }

    } catch (err) {
      console.error("Controller monitor error:", err.message);
    }
  }, CHECK_INTERVAL_MS);

};

module.exports = startControllerMonitor;