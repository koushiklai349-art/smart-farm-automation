const { runtime } = require("../../store/runtime.store");

async function evaluateSwarmBalance(dispatchCommand) {

  const devices = Object.keys(runtime.devices || {});
  if (!devices.length) return;

  let activeFans = 0;

  for (const d of devices) {
    if (runtime.actuatorState?.[d]?.fan === "ON")
      activeFans++;
  }

  // If too many fans running → balance load
  if (activeFans > 2) {

    console.log("[SWARM] Fan overload detected");

    for (const d of devices) {

      if (runtime.actuatorState?.[d]?.fan === "ON") {

        console.log("[SWARM] Turning OFF fan for", d);

        await dispatchCommand({
          commandId: Date.now().toString(),
          deviceId: d,
          action: "FAN_OFF",
          issuedAt: new Date().toISOString(),
          reason: "SWARM_LOAD_BALANCE"
        });

        break; // turn off only one per cycle
      }
    }
  }
}

module.exports = {
  evaluateSwarmBalance
};