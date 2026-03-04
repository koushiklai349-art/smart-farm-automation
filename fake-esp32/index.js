const { startTelemetry } = require("./telemetry.publisher");

const FARM_ID = "farm-01";
const DEVICE_ID = "esp32_001";

startTelemetry(DEVICE_ID, FARM_ID);
