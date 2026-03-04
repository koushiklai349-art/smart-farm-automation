const express = require("express");
const router = express.Router();
const { runChaosTest } =
  require("../../phase-f/simulation/chaos.testing.engine");

router.post("/ai/chaos", (req, res) => {

  const { type } = req.body;

  runChaosTest(type);

  res.json({
    status: "CHAOS_TRIGGERED",
    type
  });
});

module.exports = router;