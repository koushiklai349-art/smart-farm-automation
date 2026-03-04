const controllerStore = require("../store/controller.store");

function validateRoleAccess({ deviceId, source, role }) {

  const controller = controllerStore.getByDeviceId(deviceId);
  if (!controller) return false;

  const mode = controller.config?.mode;

  console.log("RBAC CHECK:", { mode, source, role });

  if (mode === "SAFE") return false;

  if (mode === "MANUAL") {
    return source === "MANUAL" && role === "ADMIN";
  }

  if (mode === "AUTO") {
    return source === "AI" || source === "SYSTEM";
  }

  return false;
}

module.exports = {
  validateRoleAccess
};