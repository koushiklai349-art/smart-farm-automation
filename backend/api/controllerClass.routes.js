const express = require("express");
const router = express.Router();
const {
  createControllerClass,
  getControllerClasses,
} = require("../controllers/controllerClass.controller");

router.post("/", createControllerClass);
router.get("/", getControllerClasses);

module.exports = router;