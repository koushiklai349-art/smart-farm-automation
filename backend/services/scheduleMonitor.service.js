const { runScheduleEngine } = require("./schedule.service");

const startScheduleMonitor = () => {
  setInterval(async () => {
    try {
      await runScheduleEngine();
    } catch (err) {
      console.error("Schedule engine error:", err.message);
    }
  }, 60000); // every 1 minute
};

module.exports = startScheduleMonitor;