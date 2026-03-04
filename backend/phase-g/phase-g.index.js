// backend/phase-g/phase-g.index.js

const { runtime } = require("../store/runtime.store.js");
const { persistent } = require("../store/persistent.store.js");

const { evaluateSchedulesAdapter } =
  require("./adapter/schedule.engine.adapter.js");
const { executeScheduleDecisions } =
  require("./bridge/schedule.command.bridge.js");

function getCurrentTime() {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
}

function startPhaseG() {
  console.log("⏰ Phase-G Scheduler started");

  setInterval(async () => {
    try {
      const nowTime = getCurrentTime();

      const decisions = evaluateSchedulesAdapter({
        schedules: persistent.schedules || [],
        nowTime,
        actuatorState: persistent.actuatorState || {},
        overrideMode: persistent.overrideMode || {}
      });

      if (decisions.length > 0) {
        await executeScheduleDecisions(decisions);
      }
    } catch (err) {
      console.error("[PHASE-G] scheduler error", err.message);
    }
  }, 60000);
}

module.exports = {
  startPhaseG
};
