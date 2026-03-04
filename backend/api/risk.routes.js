const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth.middleware");
const roleGuard = require("../middleware/role.guard");

const {
  getDeviceRisk,
  getFarmRisk
} = require("../controllers/risk.controller");

router.get(
  "/:deviceId",
  requireAuth,
  roleGuard(["ADMIN", "OPERATOR"]),
  getDeviceRisk
);

router.get(
  "/farm",
  requireAuth,
  roleGuard(["ADMIN"]),
  getFarmRisk
);

module.exports = router;   // 👈 MUST BE THIS