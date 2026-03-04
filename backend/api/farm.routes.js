const express = require("express");
const router = express.Router();
const {
  createFarm,
  getFarms,
} = require("../controllers/farm.controller");

router.post("/", createFarm);
router.get("/", getFarms);

module.exports = router;