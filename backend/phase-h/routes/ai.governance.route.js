const express = require("express");
const router = express.Router();
const { runtime } =
  require("../../store/runtime.store");

router.get("/ai/governance", (req, res) => {

  res.json({
    stability: runtime.aiStability || {},
    systemHealth: runtime.systemHealth || {},
    strategy: runtime.strategy || {},
    trustIndex: runtime.trustIndex || {},
    arbitrationWeights:
      runtime.arbitrationWeights || {},
    architecture:
      runtime.architecture || {},
    alerts: runtime.alerts?.length || 0
  });
});

module.exports = router;