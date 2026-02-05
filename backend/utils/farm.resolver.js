function getFarmId(deviceId, store) {
  return store.devices?.[deviceId]?.farmId || "default";
}

module.exports = { getFarmId };
