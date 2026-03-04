const express = require("express");
const router = express.Router();
const alertService = require("../services/alert.service");

router.get("/", async (req, res) => {
  const alerts = await alertService.getActiveAlerts();
  res.json(alerts);
});

router.put("/:id/resolve", async (req, res) => {
  const updated = await alertService.resolveAlert(req.params.id);
  res.json(updated);
});

module.exports = router;