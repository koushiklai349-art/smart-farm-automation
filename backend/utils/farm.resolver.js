const {
  getControllersForLine,
  getPrimaryController,
  setPrimaryController
} = require("../store/line.store");

const { runtime } = require("../store/runtime.store");

function resolveControllerForLine(lineId) {

  const controllers = getControllersForLine(lineId);
  if (!controllers.length) return null;

  // Try primary first
  const primary = getPrimaryController(lineId);

  if (
    primary &&
    runtime.devices?.[primary]?.status === "ONLINE"
  ) {
    return { id: primary };
  }

  // Failover search
  for (const controllerId of controllers) {

    if (runtime.devices?.[controllerId]?.status === "ONLINE") {

      // promote to primary
      setPrimaryController(lineId, controllerId);

      console.log(
        "[FAILOVER] New primary for",
        lineId,
        "→",
        controllerId
      );

      return { id: controllerId };
    }
  }

  return null;
}

module.exports = {
  resolveControllerForLine
};