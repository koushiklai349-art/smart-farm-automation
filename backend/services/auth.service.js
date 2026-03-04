const jwt = require("jsonwebtoken");
const { getUser } = require("../store/user.store");
const SECRET = "SUPER_SECRET_KEY";
const bcrypt = require("bcrypt");
const { recordFailure,isLocked,resetAttempts } = require("../store/login.attempt.store");

async function login(username, password) {

  if (isLocked(username)) {
    return "LOCKED";
  }

  const user = getUser(username);
  if (!user) {
    recordFailure(username);
    return null;
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    recordFailure(username);
    return null;
  }

  resetAttempts(username);

  return jwt.sign(
    { username: user.username, role: user.role },
    SECRET,
    { expiresIn: "1h" }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

module.exports = {
  login,
  verifyToken
};