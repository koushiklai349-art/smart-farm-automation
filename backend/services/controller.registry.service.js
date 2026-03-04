// backend/services/controller.registry.service.js

const { persistent, savePersistent } =
  require("../store/persistent.store");

class ControllerRegistryService {
  register({ instanceId, controllerClassId, hardwareUid, meta = {} }) {
    if (!instanceId) throw new Error("instanceId is required");
    if (!controllerClassId) throw new Error("controllerClassId is required");
    if (!hardwareUid) throw new Error("hardwareUid is required");

    persistent.controllerInstances =
      persistent.controllerInstances || {};

    // prevent duplicate hardware
    const existing = Object.values(persistent.controllerInstances)
      .find(ci => ci.hardwareUid === hardwareUid);

    if (existing) {
      return existing;
    }

    const controllerInstance = {
      id: instanceId,
      controllerClassId,
      hardwareUid,
      lineId: null,
      status: "pending",
      registeredAt: Date.now(),
      lastSeenAt: null,
      meta
    };

    persistent.controllerInstances[instanceId] = controllerInstance;
    savePersistent();

    return controllerInstance;
  }

  list() {
    return Object.values(persistent.controllerInstances || {});
  }

  getById(id) {
    return persistent.controllerInstances?.[id] || null;
  }
}

module.exports = new ControllerRegistryService();
