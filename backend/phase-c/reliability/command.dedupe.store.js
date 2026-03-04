const executedCommands = new Set();

function isDuplicate(commandId) {
  return executedCommands.has(commandId);
}

function markExecuted(commandId) {
  executedCommands.add(commandId);
}

module.exports = {
  isDuplicate,
  markExecuted
};
