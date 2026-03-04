const users = {
  admin: {
    username: "admin",
    passwordHash: "$2b$10$mFYdO7vtTgiwaW64QEjVq.bx4oPX4vSvOuJYvCCs2fGDODOZrapDm",
    role: "ADMIN"
  },
  operator: {
    username: "operator",
    passwordHash: "$2b$10$mFYdO7vtTgiwaW64QEjVq.bx4oPX4vSvOuJYvCCs2fGDODOZrapDm",
    role: "USER"
  }
};

function getUser(username) {
  return users[username];
}

module.exports = {
  getUser
};