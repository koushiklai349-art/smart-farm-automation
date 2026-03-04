const { runtime } = require("../../store/runtime.store");

async function evaluateCoordination(deviceId, dispatchCommand) {

  const sourceTelemetry =
    runtime.telemetry?.[deviceId]?.sensors;

  const sourceRuntime =
    runtime.devices?.[deviceId];

  if (!sourceTelemetry || !sourceRuntime) return;

  const lineId = sourceRuntime.lineId;
  if (!lineId) return;

  // High heat trigger
  if (sourceTelemetry.temperature < 35) return;

  console.log(
    "[COORDINATION] High heat detected on",
    deviceId
  );

  // Find same line devices
  const peers = Object.entries(runtime.devices)
    .filter(([id, dev]) =>
      id !== deviceId &&
      dev.lineId === lineId &&
      dev.status === "ONLINE"
    );

  for (const [peerId] of peers) {

    const peerState =
      runtime.actuatorState?.[peerId] || {};

    if (peerState.fan === "ON") continue;

    console.log(
      "[COORDINATION] Proactive FAN_ON for",
      peerId
    );

    await dispatchCommand({
      commandId: Date.now().toString(),
      deviceId: peerId,
      action: "FAN_ON",
      issuedAt: new Date().toISOString()
    });
  }
}

module.exports = {
  evaluateCoordination
};