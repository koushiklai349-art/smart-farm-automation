const express = require("express");
const router = express.Router();
const {
  createZone,
  getZones,
} = require("../controllers/zone.controller");

router.post("/", createZone);
router.get("/", getZones);

module.exports = router;