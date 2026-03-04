const { runtime } = require("../store/runtime.store");

function validateCommandSafety(command) {

  console.log("SAFETY INPUT:", {
  deviceId: command.deviceId,
  action: command.action,
  state: runtime.actuatorState?.[command.deviceId]
});
  // Energy hard limit
  if (runtime.energy?.dailyLimit &&
      runtime.energy.todayUsage >= runtime.energy.dailyLimit) {
    return { status: "BLOCKED_ENERGY_LIMIT" };
  }

  // Actuator duplicate state block
  const deviceState = runtime.actuatorState?.[command.deviceId];
  if (deviceState) {
    const [target, value] = command.action.split("_");
    const current = deviceState[target?.toLowerCase()];
    if (current === value) {
      return { status: "IGNORED_ALREADY_IN_STATE" };
    }
  }

  return { status: "SAFE" };
}

module.exports = {
  validateCommandSafety
};