// backend/store/audit.store.js
console.log("AUDIT STORE LOADED FROM:", __filename);

const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../audit.store.json");

let auditStore = { auditLogs: [], commandHistory: {} };

if (fs.existsSync(FILE)) {
  auditStore = JSON.parse(fs.readFileSync(FILE));
}

function persist() {
  fs.writeFileSync(FILE, JSON.stringify(auditStore, null, 2));
}

function appendAudit(event, payload = {}) {
  auditStore.auditLogs.push({
    event,
    payload,
    time: new Date().toISOString()
  });
  persist();
}

function recordCommandHistory(deviceId, cmd) {
  auditStore.commandHistory[deviceId] =
    auditStore.commandHistory[deviceId] || [];
  auditStore.commandHistory[deviceId].push(cmd);
  persist();
}

/**
 * 🔑 Missing hook (used by dispatch / recovery pipeline)
 */
function logCommandIssued(command) {
  appendAudit("COMMAND_ISSUED", {
    deviceId: command.deviceId,
    lineId: command.lineId,
    commandId: command.commandId,
    action: command.action,
    signature: command.signature
  });

  recordCommandHistory(command.deviceId, {
    commandId: command.commandId,
    action: command.action,
    time: new Date().toISOString()
  });
}

function logCommandSuccess(data) {
  appendAudit("COMMAND_SUCCESS", {
    deviceId: data.deviceId,
    commandId: data.commandId,
    executedAt: data.executedAt
  });
}

module.exports = {
  appendAudit,
  recordCommandHistory,
  logCommandIssued,
  logCommandSuccess
};
