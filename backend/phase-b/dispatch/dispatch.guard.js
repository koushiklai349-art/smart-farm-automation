// phase-b/dispatch/dispatch.guard.js

const controllerStore = require("../../store/controller.store");

function canDispatch(command) {
  if (!command || !command.deviceId) return false;
  if (!command.commandId) return false;
  if (!command.action) return false;

  const controllerInstance =
    controllerStore.getByDeviceId(command.deviceId);

  if (!controllerInstance) return false;

  if (!controllerInstance.location?.lineId) return false;

  if (
    controllerInstance.status !== "approved" &&
    controllerInstance.status !== "online" &&
    controllerInstance.status !== "ASSIGNED"
  ) {
    return false;
  }

  return true;
}

module.exports = {
  canDispatch
};
