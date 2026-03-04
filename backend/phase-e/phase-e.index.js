// backend/phase-e/phase-e.index.js

const { startStatusSubscriber } = require("./mqtt/status.subscriber.js");
const { startTelemetrySubscriber } = require("./mqtt/telemetry.subscriber.js");

function startPhaseE(farmId, deviceId) {
  startStatusSubscriber(farmId, deviceId);
  startTelemetrySubscriber(farmId, deviceId);
}

module.exports = {
  startPhaseE
};
