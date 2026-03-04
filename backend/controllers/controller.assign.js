const controllerStore = require("../store/controller.store");

exports.assignController = (req, res) => {
  const { id } = req.params;
  const { farmId, zoneId, shedId, lineId, controllerClass } = req.body;

  const controller = controllerStore.getById(id);
  if (!controller) {
    return res.status(404).json({ error: "Controller not found" });
  }

  const updated = controllerStore.update(id, {
    assigned: true,
    status: "ASSIGNED",
    controllerClass,
    location: { farmId, zoneId, shedId, lineId },
    config: {
      mode: "SAFE", // SAFE | MANUAL | AUTO
      pins: {},
      rules: [],
      schedules: [],
      safety: {
       maxRunSec: 20
     }
    }
  });

  res.json(updated);
};
