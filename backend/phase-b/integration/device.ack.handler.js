const auditStore = require("../../store/audit.store.js");
const { markExecuted } = require("../../phase-c/reliability/command.dedupe.store.js");
const { emitRuntimeEvent } = require("../../phase-c/events/runtime.events.js");
const { saveRuntime } = require("../../store/runtime.persistence");
const bus = require("../../phase-c/mqtt/mqtt.mock.bus");
const { runtime } = require("../../store/runtime.store");
const { removeCommand } = require("../../services/command.queue.service");
const { releaseActive } = require("../../services/command.orchestrator.service");
const Command = require("../../models/command.model");
const { updateEnergyUsage } = require("../../services/energy.optimizer.service");
const incidentService = require("../../services/incident.service");
const recoveryService = require("../../services/recovery.service");
const globalAI = require("../../services/global.ai.service");


async function handleDeviceAck(ack) {

console.log("ACK RECEIVED:", ack);
console.log("QUEUE STATE:", runtime.commandQueue);
  // 1️⃣ Dedupe mark
  markExecuted(ack.commandId);

  // 2️⃣ Update actuator state (NEW 🔥)
  const cmdMeta = runtime.commandQueue?.[ack.commandId];

  if (cmdMeta && cmdMeta.action) {

    const [target, value] = cmdMeta.action.split("_");

    runtime.actuatorState = runtime.actuatorState || {};
    runtime.actuatorState[cmdMeta.deviceId] =
      runtime.actuatorState[cmdMeta.deviceId] || {};

    runtime.actuatorState[cmdMeta.deviceId][target.toLowerCase()] = value;

    removeCommand(ack.commandId);
  }
  saveRuntime();
  // 🔥 Update Command DB Status
await Command.findOneAndUpdate(
  { commandId: ack.commandId, status: "sent" },
  { status: "executed" }
);
updateEnergyUsage(5); // example energy unit
  // 3️⃣ Audit
  auditStore.logCommandSuccess({
    commandId: ack.commandId,
    deviceId: ack.deviceId,
    executedAt: ack.executedAt || new Date().toISOString()
  });
  globalAI.recordLearning(
  ack.deviceId,
  "COMMAND_EXECUTION",
  true
);
  // 4️⃣ Metrics
  runtime.metrics.commandsSuccess =
  (runtime.metrics.commandsSuccess || 0) + 1;

  // 5️⃣ Emit runtime event
  emitRuntimeEvent({
    type: "DEVICE_ACK",
    deviceId: ack.deviceId,
    commandId: ack.commandId,
    status: "SUCCESS",
    at: new Date().toISOString()
  });

incidentService.resolveIncident(
  ack.deviceId,
  "DEVICE_RISK"
);
  releaseActive(ack.deviceId);
  recoveryService.resetRecovery(ack.deviceId);
  return { status: "ACK_PROCESSED" };
  
}

function startAckListener(deviceId) {
  bus.subscribe(`ack/${deviceId}`, (ack) => {
    handleDeviceAck(ack);

    runtime.lastAck = runtime.lastAck || {};
    runtime.lastAck[ack.commandId] = ack.status;
  });
}

module.exports = {
  handleDeviceAck,
  startAckListener
};