const controllerStore = require("../store/controller.store");

exports.heartbeat = (req, res) => {
  const { controllerId } = req.body;

  const controller = controllerStore.getById(controllerId);
  if (!controller) {
    return res.status(404).json({ error: "Unknown controller" });
  }

  controllerStore.update(controllerId, {
    lastSeen: Date.now(),
    status: "ONLINE"
  });

  res.json({ ok: true });
};
