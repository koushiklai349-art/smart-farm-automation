// backend/core/controllerInstance.model.js

const ALLOWED_STATUS = [
  "pending",   // registered but not approved
  "approved",  // approved but offline
  "online",    // active + heartbeat ok
  "offline",   // heartbeat missing
  "blocked"    // manually disabled
];

class ControllerInstance {
  constructor({
    id,
    controllerClassId,
    lineId = null,
    hardwareUid,
    status = "pending",
    lastSeenAt = null,
    registeredAt = Date.now(),
    meta = {}
  }) {
    if (!id) throw new Error("ControllerInstance.id is required");
    if (!controllerClassId) {
      throw new Error("ControllerInstance.controllerClassId is required");
    }
    if (!hardwareUid) {
      throw new Error("ControllerInstance.hardwareUid is required");
    }

    if (!ALLOWED_STATUS.includes(status)) {
      throw new Error(`Invalid ControllerInstance status: ${status}`);
    }

    this.id = id; // ESP32-P1-S1-FL1 (logical id)
    this.controllerClassId = controllerClassId;
    this.lineId = lineId; // null until manually assigned
    this.hardwareUid = hardwareUid; // chip id / mac
    this.status = status;

    this.lastSeenAt = lastSeenAt;
    this.registeredAt = registeredAt;
    this.meta = meta;
  }

  assignToLine(lineId) {
    if (!lineId) throw new Error("lineId is required for assignment");
    this.lineId = lineId;
  }

  updateHeartbeat(timestamp = Date.now()) {
    this.lastSeenAt = timestamp;
    this.status = "online";
  }

  markOffline() {
    this.status = "offline";
  }

  block() {
    this.status = "blocked";
  }

  toJSON() {
    return {
      id: this.id,
      controllerClassId: this.controllerClassId,
      lineId: this.lineId,
      hardwareUid: this.hardwareUid,
      status: this.status,
      lastSeenAt: this.lastSeenAt,
      registeredAt: this.registeredAt,
      meta: this.meta
    };
  }
}

module.exports = ControllerInstance;
