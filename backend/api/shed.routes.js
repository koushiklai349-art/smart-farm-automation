const express = require("express");
const router = express.Router();
const {
  createShed,
  getSheds,
} = require("../controllers/shed.controller");

router.post("/", createShed);
router.get("/", getSheds);

module.exports = router;