// auto.state.store.js
const autoState = new Map();
// key = deviceId:target → "ON" | "OFF"

export function getAutoState(deviceId, target) {
  return autoState.get(`${deviceId}:${target}`);
}

export function setAutoState(deviceId, target, state) {
  autoState.set(`${deviceId}:${target}`, state);
}
