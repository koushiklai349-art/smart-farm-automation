// commands/command.factory.js

export function createCommand(deviceId, action, source = "UI") {
  return {
    id: `CMD-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    deviceId,
    action,
    source,
    status: "PENDING",
    issuedAt: Date.now(),
    retryCount: 0
  };
}
