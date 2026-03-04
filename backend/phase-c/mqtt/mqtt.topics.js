function commandTopic(farmId, deviceId) {
  return `farm/${farmId}/device/${deviceId}/command`;
}

function ackTopic(farmId, deviceId) {
  return `farm/${farmId}/device/${deviceId}/ack`;
}

function errorTopic(farmId, deviceId) {
  return `farm/${farmId}/device/${deviceId}/error`;
}

function statusTopic(farmId, deviceId) {
  return `farm/${farmId}/device/${deviceId}/status`;
}

module.exports = {
  commandTopic,
  ackTopic,
  errorTopic,
  statusTopic
};
