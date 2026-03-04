const runtimeState = {
  devices: {}
};

export function updateDeviceStatus(deviceId, status) {
  runtimeState.devices[deviceId] = {
    status,
    updatedAt: new Date().toISOString()
  };
}

export function getDeviceStatus(deviceId) {
  return runtimeState.devices[deviceId] || null;
}
