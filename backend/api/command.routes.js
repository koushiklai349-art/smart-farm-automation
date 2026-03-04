const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.middleware");
const roleGuard = require("../middleware/role.guard");
const { createCommand,getCommands } = require("../controllers/command.controller");

router.post(
  "/",
  requireAuth,
  roleGuard(["ADMIN", "OPERATOR"]),
  createCommand
);
router.get("/by-user/:username", requireAuth, async (req, res) => {
  const Command = require("../models/command.model");

  const data = await Command.find({
    issuedBy: req.params.username
  }).sort({ createdAt: -1 });

  res.json(data);
});
router.get("/", getCommands);

module.exports = router;