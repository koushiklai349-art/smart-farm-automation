const DeviceErrorContract = {
  commandId: "uuid-string",
  deviceId: "device-unique-id",
  errorCode: "HW_TIMEOUT | INVALID_ACTION | EXEC_FAIL",
  errorMessage: "human readable",
  occurredAt: "ISO_TIMESTAMP"
};

module.exports = {
  DeviceErrorContract
};
