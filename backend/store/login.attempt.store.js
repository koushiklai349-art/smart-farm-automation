const attempts = {};

function recordFailure(username) {
  const now = Date.now();

  if (!attempts[username]) {
    attempts[username] = { count: 1, lockedUntil: null };
    return;
  }

  if (attempts[username].lockedUntil && now < attempts[username].lockedUntil) {
    return;
  }

  attempts[username].count++;

  if (attempts[username].count >= 5) {
    attempts[username].lockedUntil = now + 10 * 60 * 1000; // 10 min
    attempts[username].count = 0;
  }
}

function isLocked(username) {
  const entry = attempts[username];
  if (!entry) return false;

  if (!entry.lockedUntil) return false;

  return Date.now() < entry.lockedUntil;
}

function resetAttempts(username) {
  delete attempts[username];
}

module.exports = {
  recordFailure,
  isLocked,
  resetAttempts
};