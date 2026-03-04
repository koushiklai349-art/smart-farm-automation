const express = require("express");
const router = express.Router();
const { dispatchCommand } = require("../phase-b/phase-b.index.js");
const { runtime } = require("../store/runtime.store.js");
const { persistent, savePersistent } = require("../store/persistent.store.js");
const { requireAuth } = require("../middleware/auth.middleware");
const roleGuard = require("../middleware/role.guard");
const { unlockDevice } = require("../controllers/device.controller");

function cryptoId() {
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2)
  );
}

// Register Device
router.post("/register", (req, res) => {
  const d = req.body;

  if (!d.deviceId || !d.farmId) {
    return res.status(400).json({ error: "INVALID_PAYLOAD" });
  }

  persistent.devices[d.deviceId] = {
    deviceId: d.deviceId,
    farmId: d.farmId,
    lineId: d.lineId || null,
    species: d.species,
    location: d.location
  };

  savePersistent();

  runtime.devices[d.deviceId] = {
    lastSeen: new Date().toISOString(),
    status: "ONLINE",
    lineId: d.lineId || null
  };

  res.json({ success: true });
});

// Heartbeat
router.post("/:id/heartbeat", (req, res) => {
  const id = req.params.id;

  if (!runtime.devices[id]) {
    return res.status(404).json({ error: "DEVICE_NOT_REGISTERED" });
  }

  runtime.devices[id].lastSeen = new Date().toISOString();
  runtime.devices[id].status = "ONLINE";

  res.json({ success: true });
});

// Dispatch Command
router.post(
  "/:id/command",
  requireAuth,
  roleGuard(["ADMIN", "OPERATOR"]),
  async (req, res) => {
  const deviceId = req.params.id;
   if (
  req.user.role === "OPERATOR" &&
  req.body.source !== "MANUAL"
) {
  return res.status(403).json({
    error: "OPERATOR_CAN_ONLY_SEND_MANUAL_COMMANDS"
  });
}
  if (!runtime.devices[deviceId]) {
    return res.status(404).json({ error: "DEVICE_NOT_REGISTERED" });
  }
  
  try {
    const result = await dispatchCommand({
  commandId: cryptoId(),
  deviceId,
  action: req.body.action,
  source: req.body.source,
  role: req.user.role,// 🔥 ADD THIS
  issuedAt: new Date().toISOString()
});

    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});
router.post(
  "/unlock/:deviceId",
  requireAuth,
  roleGuard(["ADMIN"]),
  unlockDevice
);
module.exports = router;