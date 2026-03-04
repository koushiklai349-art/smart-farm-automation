const crypto = require("crypto");
const controllerStore = require("../store/controller.store");

exports.registerController = (req, res) => {
  const { deviceId, firmwareVersion, mac, capabilities } = req.body;

  if (!deviceId) {
    return res.status(400).json({ error: "deviceId required" });
  }

  const existing = controllerStore.getByDeviceId(deviceId);

  if (existing) {
    return res.json({
      status: existing.status,
      controllerId: existing.id
    });
  }

  const controller = {
    id: crypto.randomUUID(),
    deviceId,
    firmwareVersion,
    mac,
    capabilities,
    status: "PENDING",
    assigned: false,
    config: null,
    lastSeen: null,
    createdAt: Date.now()
  };

  controllerStore.create(controller);

  res.json({
    status: "PENDING",
    controllerId: controller.id
  });
};
