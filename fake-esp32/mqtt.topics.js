function telemetryTopic(farmId, deviceId) {
  return `farm/${farmId}/device/${deviceId}/telemetry`;
}

module.exports = {
  telemetryTopic
};
