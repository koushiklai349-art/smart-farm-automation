// alert.dto.js
const AlertDTO = {
  id: "string",
  type: "critical | warning | info",
  deviceId: "string",
  message: "string",
  at: "ISO_TIMESTAMP"
};

module.exports = { AlertDTO };
