const { startMqttSubscribers } = require("../phase-c/mqtt/mqtt.subscriber.js");
const { startPhaseE } = require("../phase-e/phase-e.index.js");
const { startPhaseF } = require("../phase-f/phase-f.index.js");
const { startPhaseG } = require("../phase-g/phase-g.index.js");
const { startPhaseH } = require("../phase-h/phase-h.index.js");
const { bootstrapDevice } = require("../phase-d/identity/device.identity.service.js");
const { startAckListener } = require("../phase-b/integration/device.ack.handler");
const { startMockDevice } = require("../phase-c/mqtt/mqtt.mock.device");
const { recoverRuntimeDevices } = require("../services/runtime.recovery.service");
const { persistent } = require("../store/persistent.store");
const { loadAIMemory } = require("../services/ai.memory.service");
const { loadAISnapshot } = require("../services/ai.snapshot.service");


function bootstrapSystem(app, config) {

  recoverRuntimeDevices();
  loadAIMemory();
  loadAISnapshot();
  const { farmId } = config;

  startPhaseH(app);

  const devices = Object.values(persistent.devices || {});

  for (let device of devices) {

    const deviceId = device.deviceId;

    bootstrapDevice(deviceId, "MOCK_SECRET");

    startMqttSubscribers(farmId, deviceId);
    startMockDevice(deviceId);
    startAckListener(deviceId);

    console.log("✅ Bootstrapped device:", deviceId);
  }

  startPhaseE(farmId);
  startPhaseF();
  startPhaseG();

  console.log("🚀 System bootstrap complete");
}

module.exports = {
  bootstrapSystem
};