const express = require("express");
const router = express.Router();
const { login } = require("../services/auth.service");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const result = await login(username, password);

  if (result === "LOCKED") {
    return res.status(403).json({ error: "ACCOUNT_LOCKED" });
  }

  if (!result) {
    return res.status(401).json({ error: "INVALID_CREDENTIALS" });
  }

  res.json({ token: result });
});

module.exports = router;