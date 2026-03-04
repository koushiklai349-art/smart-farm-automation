// backend/services/controller.assignment.service.js

const { persistent, savePersistent } =
  require("../store/persistent.store");

class ControllerAssignmentService {
  assignToLine({ controllerInstanceId, lineId }) {
    if (!controllerInstanceId) {
      throw new Error("controllerInstanceId is required");
    }
    if (!lineId) {
      throw new Error("lineId is required");
    }

    const ci = persistent.controllerInstances?.[controllerInstanceId];
    if (!ci) throw new Error("ControllerInstance not found");

    if (ci.status === "blocked") {
      throw new Error("Blocked controller cannot be assigned");
    }

    ci.lineId = lineId;
    ci.status = "approved";

    savePersistent();
    return ci;
  }

  unassign(controllerInstanceId) {
    const ci = persistent.controllerInstances?.[controllerInstanceId];
    if (!ci) throw new Error("ControllerInstance not found");

    ci.lineId = null;
    ci.status = "approved";

    savePersistent();
    return ci;
  }
}

module.exports = new ControllerAssignmentService();
