const express = require("express");
const router = express.Router();

const { registerController } = require("../controllers/controller.registry");
const { assignController } = require("../controllers/controller.assign");
const { getControllerConfig } = require("../controllers/controller.config");
const heartbeat = require("../services/heartbeat.api");
const controllerStore = require("../store/controller.store");

// Register
router.post("/register", registerController);

// Assign
router.post("/:id/assign", assignController);

// Config
router.get("/:id/config", getControllerConfig);

// Heartbeat
router.post("/heartbeat", heartbeat);

// 🔥 MODE UPDATE ROUTE
router.post("/:id/mode", (req, res) => {
  const { id } = req.params;
  const { mode } = req.body;

  const allowed = ["SAFE", "MANUAL", "AUTO"];
  if (!allowed.includes(mode)) {
    return res.status(400).json({ error: "INVALID_MODE" });
  }

  const controller = controllerStore.getById(id);
  if (!controller) {
    return res.status(404).json({ error: "Controller not found" });
  }

  const updated = controllerStore.update(id, {
    config: {
      ...controller.config,
      mode
    }
  });

  res.json({ success: true, controller: updated });
});

module.exports = router;