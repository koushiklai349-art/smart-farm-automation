const express = require("express");
const router = express.Router();

const { createRule, getAllRules } = require("../controllers/rule.controller");

router.post("/", createRule);
router.get("/", getAllRules);

module.exports = router;