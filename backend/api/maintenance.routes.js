const express = require("express");
const router = express.Router();
const {
  enableMaintenance,
  disableMaintenance
} = require("../services/maintenance.service");

router.post("/enable", (req, res) => {
  const { reason } = req.body;
  const result = enableMaintenance(reason);
  res.json(result);
});

router.post("/disable", (req, res) => {
  const result = disableMaintenance();
  res.json(result);
});

module.exports = router;