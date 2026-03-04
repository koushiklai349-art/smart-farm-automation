const crypto = require("crypto");
const { getDeviceSecret } = require("../identity/device.identity.service.js");

function signCommand(command) {
  const secret = getDeviceSecret(command.deviceId);
  if (!secret) {
    throw new Error("Unknown device");
  }

  const data =
    `${command.commandId}|` +
    `${command.deviceId}|` +
    `${command.action}|` +
    `${command.issuedAt}`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("hex");

  return {
    ...command,
    signature
  };
}

module.exports = {
  signCommand
};
