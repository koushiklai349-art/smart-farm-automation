// device.dto.js
const DeviceDTO = {
  deviceId: "string",
  status: "ONLINE | OFFLINE",
  lastSeen: "ISO_TIMESTAMP",
  telemetry: "object"
};

module.exports = { DeviceDTO };
