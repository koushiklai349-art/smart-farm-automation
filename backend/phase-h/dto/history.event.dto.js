// history.event.dto.js
const HistoryEventDTO = {
  id: "string",
  source: "MANUAL | RULE | SCHEDULE",
  deviceId: "string",
  action: "string",
  status: "SENT | SUCCESS | FAILED",
  at: "ISO_TIMESTAMP"
};

module.exports = { HistoryEventDTO };
