const { runtime } = require("../../store/runtime.store");
const { createIncident } = require("../incident/incident.engine");

const OFFLINE_TIMEOUT_MS = 30000; // 30 sec grace period

async function evaluateFailover(dispatchCommand) {

  const devices = runtime.devices || {};
  const now = Date.now();

  for (const deviceId of Object.keys(devices)) {

    const device = devices[deviceId];

    if (!device.lastSeen) continue;

    const lastSeenTime = new Date(device.lastSeen).getTime();
    const inactiveFor = now - lastSeenTime;

    // ✅ Only consider offline if no heartbeat for 30 sec
    if (inactiveFor < OFFLINE_TIMEOUT_MS) continue;

    console.log("[FAILOVER] Confirmed offline:", deviceId);

    const lineId = device.lineId;

    // Find backup in same line
    const backupId = Object.keys(devices).find(id =>
      id !== deviceId &&
      devices[id].lineId === lineId &&
      devices[id].status === "ONLINE"
    );

    if (backupId) {

      console.log("[FAILOVER] Backup found:", backupId);

      await dispatchCommand({
        commandId: Date.now().toString(),
        deviceId: backupId,
        action: "TAKE_OVER",
        issuedAt: new Date().toISOString(),
        reason: "SWARM_FAILOVER",
        source: "SYSTEM_AI",
        role: "SYSTEM"
      });

      createIncident({
        type: "FAILOVER_ACTIVATED",
        deviceId,
        details: {
          failedDevice: deviceId,
          backupDevice: backupId
        }
      });

    } else {

      createIncident({
        type: "FAILOVER_NO_BACKUP",
        deviceId,
        details: {
          message: "No backup controller available"
        }
      });
    }

    // Mark officially offline after action
    device.status = "OFFLINE";
  }
}

module.exports = {
  evaluateFailover
};