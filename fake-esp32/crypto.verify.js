const crypto = require("crypto");

const DEVICE_SECRET = "MOCK_SECRET";

function verifyCommand(command) {
  const data =
    `${command.commandId}|` +
    `${command.deviceId}|` +
    `${command.action}|` +
    `${command.issuedAt}`;

  const expected = crypto
    .createHmac("sha256", DEVICE_SECRET)
    .update(data)
    .digest("hex");

  return expected === command.signature;
}

module.exports = {
  verifyCommand
};
