const DeviceCommandContract = {
  commandId: "uuid-string",
  deviceId: "device-unique-id",
  action: "PUMP_ON | PUMP_OFF | FAN_ON | FAN_OFF",
  params: {
    durationSec: 0
  },
  issuedAt: "ISO_TIMESTAMP",
  signature: "HMAC_SHA256_HEX"
};

module.exports = {
  DeviceCommandContract
};
