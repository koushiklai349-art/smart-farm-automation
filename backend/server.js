require("dotenv").config();
const connectDB = require("./db");
connectDB();
const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const devicesRoutes = require("./api/devices.routes");
const controllersRoutes = require("./api/controllers.routes");
const rulesRoutes = require("./api/rules.routes");
const { bootstrapSystem } = require("./bootstrap/system.bootstrap");
const { setAiMode } = require("./services/runtime.service");
const { setEnergyLimit } = require("./services/runtime.service");
const { setDigitalTwinMode } = require("./services/runtime.service");
const authRoutes = require("./api/auth.routes");
const rateLimit = require("express-rate-limit");
const farmRoutes = require("./api/farm.routes");
const zoneRoutes = require("./api/zone.routes");
const shedRoutes = require("./api/shed.routes");
const lineRoutes = require("./api/line.routes");
const controllerClassRoutes = require("./api/controllerClass.routes");
const controllerInstanceRoutes = require("./api/controllerInstance.routes");
const commandRoutes = require("./api/command.routes");
const { startAckListener } = require("./phase-b/integration/device.ack.handler");
const ControllerInstance = require("./models/controllerInstance.model");
const Command = require("./models/Command.model");
const { startMockDevice } = require("./phase-c/mqtt/mqtt.mock.device");
const alertRoutes = require("./api/alert.routes");
const startScheduleMonitor = require("./services/scheduleMonitor.service");
const maintenanceRoutes = require("./api/maintenance.routes");
const { recoverCommandsOnStartup } = require("./services/restart.recovery.service");
const { cleanStaleActiveLocks } = require("./services/command.orchestrator.service");
const riskRoutes = require("./api/risk.routes");
const { startCloudSync } = require("./services/cloud.sync.scheduler");

require("./phase-c/mqtt/mqtt.mock.device");
// ================= APP =================
const app = express();
app.use(express.json());
app.use(bodyParser.json());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // max 60 requests per minute per IP
  message: { error: "TOO_MANY_REQUESTS" }
});

app.use(limiter);

// ================= CORS (DEV SAFE) =================
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Farm-Id"
  );
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ================= CORE IMPORTS =================
const { addRule } = require("./store/rule.store");
const { loadRuntime } = require("./store/runtime.persistence");
const { assignLine } = require("./store/line.store");
const { runSimulation } = require("./phase-f/simulation/simulation.engine");
const { simulateDevice } = require("./phase-g/twin/digital.twin.engine");
const { getRulesForDevice } = require("./store/rule.store");
const { handleDeviceTelemetry } = require("./phase-e/handlers/device.telemetry.handler");
const startControllerMonitor = require("./services/controllerMonitor.service.js");

const { runtime } = require("./store/runtime.store.js");
const { createRule,getAllRules } = require("./controllers/rule.controller");
const { persistent } = require("./store/persistent.store.js");

loadRuntime();
// ================= CONSTANTS =================
const PORT = 3000;
const FARM_ID = "farm-01";
const DEVICE_ID = "esp32_001";

// ================= DEVICE REGISTRATION =================

app.use("/api/devices", devicesRoutes);
app.use("/api/controllers", controllersRoutes);
app.use("/api/rules", rulesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/sheds", shedRoutes);
app.use("/api/lines", lineRoutes);
app.use("/api/controller-classes", controllerClassRoutes);
app.use("/api/controller-instances", controllerInstanceRoutes);
app.use("/api/commands", commandRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/maintenance-mode", maintenanceRoutes);
app.use("/api/risk", riskRoutes);

app.get("/", (req, res) => {
  res.send("FCOS Industrial Backend Running 🚀");
});
// ================= METRICS =================
app.get("/api/metrics", (req, res) => {
  res.json(runtime.metrics || {});
});

// ================= DASHBOARD =================
app.get("/api/dashboard/devices", (req, res) => {
  const farmId = req.headers["x-farm-id"];
  if (!farmId) return res.json([]);

  const devices = Object.values(persistent.devices || {})
    .filter(d => d.farmId === farmId)
    .map(d => ({
      deviceId: d.deviceId,
      status: runtime.devices?.[d.deviceId]?.status || "OFFLINE",
      lastSeen: runtime.devices?.[d.deviceId]?.lastSeen
    }));

  res.json(devices);
});

// ================= DASHBOARD SNAPSHOT =================
app.get("/api/dashboard/farm/:farmId/snapshot", (req, res) => {
  const farmId = req.params.farmId;

  const devices = Object.values(persistent.devices || {})
    .filter(d => d.farmId === farmId)
    .map(d => {
      const rt = runtime.devices?.[d.deviceId] || {};
      const tel = runtime.telemetry?.[d.deviceId] || {};

      return {
        deviceId: d.deviceId,
        status: rt.status || "OFFLINE",
        lastSeen: rt.lastSeen || null,
        telemetry: tel.sensors || {}
      };
    });

  res.json({
    farmId,
    devices
  });
});

const { getRules } = require("./store/rule.store");

if (!getRules().some(r => r.ruleId === "temp-high-fan" && r.baseHighThreshold)) {
  addRule({
    ruleId: "temp-high-fan",
    deviceId: "esp32_001",
    sensor: "temperature",
    lowThreshold: 0,
    highThreshold: 30,
    baseHighThreshold: 30,
    priority: 1,
    enabled: true
  });
}
app.post("/api/rules", createRule);
app.get("/api/rules", getAllRules);

app.post("/api/lines/assign", (req, res) => {
  const { lineId, controllerId } = req.body;

  if (!lineId || !controllerId) {
    return res.status(400).json({ error: "INVALID_PAYLOAD" });
  }

  assignLine(lineId, controllerId);

  res.json({
    success: true,
    message: `Controller ${controllerId} added to ${lineId}`
  });
});

app.get("/api/health", (req, res) => {
  res.json(runtime.health);
});

app.get("/api/alerts", (req, res) => {
  res.json(runtime.alerts);
});

app.get("/api/maintenance", (req, res) => {
  res.json(runtime.maintenance);
});
app.get("/api/analytics/:deviceId", (req, res) => {

  const { deviceId } = req.params;

  const data =
    runtime.caches.analytics.historical;

  res.json({
    telemetry: data.telemetry?.[deviceId] || [],
    health: data.health?.[deviceId] || [],
    risk: data.risk?.[deviceId] || []
  });
});

app.get("/api/ranking", (req, res) => {
  res.json(runtime.caches.analytics.ranking);
});

app.get("/api/optimization", (req, res) => {
  res.json(runtime.optimization);
});

app.post("/api/ai-mode", (req, res) => {
  const { enabled } = req.body;

  const result = setAiMode(enabled);

  res.json({
    success: true,
    aiMode: result
  });
});

app.get("/api/season", (req, res) => {
  res.json(runtime.season);
});

app.get("/api/energy", (req, res) => {
  res.json(runtime.energy);
});

app.post("/api/energy/limit", (req, res) => {
  const { limit } = req.body;

  const result = setEnergyLimit(limit);

  res.json({
    success: true,
    energy: result
  });
});

app.post("/api/simulate", async (req, res) => {

  const { deviceId, sensors } = req.body;

  await handleDeviceTelemetry({
    device_id: deviceId,
    temperature: sensors.temperature,
    humidity: sensors.humidity,
    soil_moisture: sensors.soil_moisture
  });

  res.json({
    simulated: true,
    deviceId
  });
});

app.get("/api/explain", (req, res) => {
  res.json(runtime.explainability.history);
});

app.get("/api/incidents", (req, res) => {

  const { severity } = req.query;

  let list = runtime.incidents.history;

  if (severity)
    list = list.filter(i => i.severity === severity);

  res.json({
    total: list.length,
    incidents: list
  });
});

app.get("/api/predictive/:deviceId", (req, res) => {
  const { deviceId } = req.params;

  const risk =
    runtime.predictive?.devices?.[deviceId];

  res.json({
    deviceId,
    riskScore: risk ?? 0
  });
});

app.get("/api/predictive-trend/:deviceId", (req, res) => {
  const { deviceId } = req.params;

  const trend =
    runtime.caches.analytics.historical.risk?.[deviceId] || [];

  res.json({
    deviceId,
    recentRisk: trend.slice(-5)
  });
});

app.get("/api/adaptive/:deviceId", (req, res) => {

  const { deviceId } = req.params;

  const data =
    runtime.adaptive?.devices?.[deviceId] || null;

  res.json({
    deviceId,
    adaptive: data
  });
});

app.get("/api/confidence/:deviceId", (req, res) => {
  const { deviceId } = req.params;

  const confidence =
    runtime.confidence?.devices?.[deviceId] ?? 0;

  res.json({
    deviceId,
    confidence
  });
});

app.post("/api/twin/simulate", (req, res) => {

  const { deviceId, telemetry } = req.body;

  const rules = getRulesForDevice(deviceId);

  const result = simulateDevice(deviceId, telemetry, rules);

  res.json(result);
});

app.post("/api/twin/enable", (req, res) => {
  const result = setDigitalTwinMode(true);
  res.json({ status: "Digital Twin Mode Enabled", twin: result });
});

app.post("/api/twin/disable", (req, res) => {
  const result = setDigitalTwinMode(false);
  res.json({ status: "Digital Twin Mode Disabled", twin: result });
});
// ================= UTIL =================
function cryptoId() {
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2)
  );
}
// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  bootstrapSystem(app, {
    farmId: FARM_ID,
    deviceId: DEVICE_ID
  });

  startControllerMonitor();
  startScheduleMonitor();
  recoverCommandsOnStartup();
  startCloudSync();
  setInterval(() => {
  cleanStaleActiveLocks();
  }, 15000);
  ControllerInstance.find().then(instances => {
    instances.forEach(instance => {
      startAckListener(instance.deviceId);
      console.log(`👂 ACK listener started for ${instance.deviceId}`);
    });
  });

  // 🔁 Restart Recovery
  Command.find({ status: "sent" }).then(commands => {
    const now = Date.now();

    commands.forEach(cmd => {
      const age = now - new Date(cmd.updatedAt).getTime();

      if (age > 15000) {
        console.log(`🔁 Recovering stuck command ${cmd.commandId}`);
        cmd.status = "failed";
        cmd.failureReason = "RECOVERED_AFTER_RESTART";
        cmd.save();
      }
    });
  });

  if (process.env.MQTT_MODE === "mock") {
    startMockDevice("esp32_feed_01");
    console.log("🤖 Mock device started for esp32_feed_01");
  }
});