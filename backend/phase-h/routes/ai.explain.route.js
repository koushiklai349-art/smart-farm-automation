const express = require("express");
const router = express.Router();
const { runtime } = require("../../store/runtime.store");

router.get("/ai/explain", (req, res) => {
  res.json({
    totalDecisions: runtime.arbitration?.history?.length || 0,
    history: runtime.arbitration?.history || []
  });
});

module.exports = router;