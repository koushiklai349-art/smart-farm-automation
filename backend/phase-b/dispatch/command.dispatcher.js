const { canDispatch } = require("./dispatch.guard.js");
const { sendToDevice } = require("../integration/device.bridge.js");
const { isDuplicate } = require("../../phase-c/reliability/command.dedupe.store.js");
const { signCommand } = require("../../phase-d/crypto/command.signer.js");
const { verifyDevice } = require("../../phase-d/identity/device.identity.service.js");
const { runtime } = require("../../store/runtime.store");
const { trackEnergyUsage } = require("../../phase-f/energy/energy.engine");
const { resolveControllerForLine } = require("../../utils/farm.resolver.js");
const { logDecisionExplanation } = require("../../phase-f/explain/explain.engine");
const { enqueueCommand } = require("../../services/command.queue.service");
const { processCommand } = require("../../services/command.orchestrator.service");
const { validateCommandSafety } = require("../../services/command.safety.service.js");
const controllerStore = require("../../store/controller.store");
const { validateRoleAccess } = require("../../services/access.control.service");

async function dispatchCommand(command) {

  if (runtime.digitalTwin?.enabled) {
    console.log("[TWIN MODE] Command blocked:", command.action);

    return {
      status: "SIMULATION_MODE",
      action: command.action
    };
  }
  
  if (runtime.simulation?.enabled) {
  console.log("[SIMULATION MODE] Command skipped");
  return { status: "SIMULATED_ONLY" };
}

  if (!command.deviceId && command.lineId) {
    const controller = resolveControllerForLine(command.lineId);

    if (!controller) {
      throw new Error("NO_ACTIVE_CONTROLLER_FOR_LINE");
    }

    command.deviceId = controller.id;
  }

  if (!verifyDevice(command.deviceId)) {
    throw new Error("DEVICE_REVOKED");
  }
  const controller = controllerStore.getByDeviceId(command.deviceId);

  if (controller?.config?.mode === "SAFE") {
   return { status: "BLOCKED_SAFE_MODE" };
  }

  if (controller?.config?.mode === "AUTO" && command.source === "MANUAL") {
    return { status: "BLOCKED_MANUAL_IN_AUTO" };
  }

  if (isDuplicate(command.commandId)) {
    return { status: "IGNORED_DUPLICATE" };
  }

  if (!canDispatch(command)) {
    throw new Error("INVALID_COMMAND");
  }

  if (!validateRoleAccess({
    deviceId: command.deviceId,
    source: command.source,
    role: command.role
  })) {
    return { status: "BLOCKED_ROLE" };
  }

  if (controller?.capabilities) {
  const target = command.action.split("_")[0].toLowerCase();
  if (!controller.capabilities.includes(target)) {
    return { status: "CAPABILITY_NOT_SUPPORTED" };
   }
  }
  const signedCommand = signCommand(command);

  enqueueCommand({
  commandId: command.commandId,
  deviceId: command.deviceId,
  action: command.action,
  issuedAt: new Date().toISOString(),
  priority: command.priority || 0
});

  runtime.metrics.commandsSent =
    (runtime.metrics.commandsSent || 0) + 1;

const safety = validateCommandSafety(command);

if (safety.status !== "SAFE") {
  return safety;
}

const decision = await processCommand(signedCommand);

if (decision.status === "BLOCKED_BY_HIGHER_PRIORITY") {
  return decision;
}

const result = await sendToDevice(signedCommand);

logDecisionExplanation({
  deviceId: command.deviceId,
  action: command.action,
  reason: command.reason || "SYSTEM_TRIGGER",
  context: {
    season: runtime.season?.current,
    energyUsage: runtime.energy?.todayUsage
  }
});
// Energy tracking
trackEnergyUsage(command.deviceId, command.action);

return result;
}

module.exports = {
  dispatchCommand
};