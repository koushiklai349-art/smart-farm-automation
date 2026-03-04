const controllerStore = require("../store/controller.store");

exports.getControllerConfig = (req, res) => {
  const { id } = req.params;
  const controller = controllerStore.getById(id);

  if (!controller) {
    return res.status(404).json({ error: "Controller not found" });
  }

  if (!controller.assigned) {
    return res.json({ mode: "SAFE_IDLE" });
  }

  res.json(controller.config);
};
