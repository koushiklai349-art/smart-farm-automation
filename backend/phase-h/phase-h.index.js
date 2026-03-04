const { registerFarmSnapshotAPI } = require("./api/farm.snapshot.api.js");
const { registerAlertsAPI } = require("./api/alerts.api.js");
const { registerHistoryAPI } = require("./api/history.api.js");
const { registerDevicesAPI } = require("./api/devices.api.js");
const { registerMetricsAPI } = require("./api/metrics.api.js");

const explainRoute = require("./routes/ai.explain.route");
const feedbackRoute = require("./routes/ai.feedback.route");
const trustRoute = require("./routes/ai.trust.route");
const chaosRoute = require("./routes/ai.chaos.route");
const stabilityRoute = require("./routes/ai.stability.route");
const governanceRoute = require("./routes/ai.governance.route");


function startPhaseH(app) {

  registerFarmSnapshotAPI(app);
  registerAlertsAPI(app);
  registerHistoryAPI(app);
  registerDevicesAPI(app);
  registerMetricsAPI(app);

  // ✅ explain route register inside function
  app.use("/api", explainRoute);
  app.use("/api", feedbackRoute);
  app.use("/api", trustRoute);
  app.use("/api", chaosRoute);
  app.use("/api", stabilityRoute);
  app.use("/api", governanceRoute);

  console.log("📊 Phase-H Dashboard APIs started (v2 complete)");
}

module.exports = {
  startPhaseH
};