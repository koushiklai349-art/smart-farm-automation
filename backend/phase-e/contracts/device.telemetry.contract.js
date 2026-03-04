// backend/phase-e/contracts/device.telemetry.contract.js

const DeviceTelemetryContract = {
  deviceId: "device-unique-id",
  farmId: "farm-unique-id",
  recordedAt: "ISO_TIMESTAMP",
  sensors: {
    temperature: "number",
    humidity: "number",
    soilMoisture: "number",
    light: "optional-number"
  }
};

module.exports = {
  DeviceTelemetryContract
};
