const express = require("express");
const router = express.Router();
const {
  createLine,
  getLines,
} = require("../controllers/line.controller");

router.post("/", createLine);
router.get("/", getLines);

module.exports = router;