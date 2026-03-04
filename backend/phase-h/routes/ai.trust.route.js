const express = require("express");
const router = express.Router();
const { runtime } = require("../../store/runtime.store");

router.get("/ai/trust", (req, res) => {
  res.json(runtime.trustIndex || {});
});

module.exports = router;