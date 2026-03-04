// backend/phase-e/contracts/device.status.contract.js

const DeviceStatusContract = {
  deviceId: "device-unique-id",
  farmId: "farm-unique-id",
  status: "ONLINE | OFFLINE",
  lastSeen: "ISO_TIMESTAMP",
  firmwareVersion: "v1.0.0",
  ip: "optional",
  meta: {
    battery: "optional-number",
    signal: "optional-number"
  }
};

module.exports = {
  DeviceStatusContract
};
