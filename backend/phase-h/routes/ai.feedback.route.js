const express = require("express");
const router = express.Router();

const { applyHumanFeedback } =
  require("../../phase-f/feedback/human.feedback.engine");

router.post("/ai/feedback", (req, res) => {

  const { reason, approved } = req.body;

  applyHumanFeedback({ reason, approved });

  res.json({
    status: "Feedback Applied",
    reason,
    approved
  });
});

module.exports = router;