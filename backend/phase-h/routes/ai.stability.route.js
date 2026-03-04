const express = require("express");
const router = express.Router();
const { runtime } =
  require("../../store/runtime.store");

router.get("/ai/stability", (req, res) => {

  res.json({
    stability: runtime.aiStability || {},
    systemHealth: runtime.systemHealth || {},
    strategy: runtime.strategy || {},
    alerts: runtime.alerts?.length || 0,
    arbitrationHistory:
      runtime.arbitrationHistory?.length || 0
  });
});

module.exports = router;