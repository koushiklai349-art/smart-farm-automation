const { verifyToken } = require("../services/auth.service");

function requireAuth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) {
    return res.status(401).json({ error: "NO_TOKEN" });
  }

  const token = header.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }

  req.user = decoded; // { username, role }
  next();
}

module.exports = {
  requireAuth
};