const rollbackPolicy = {
  motor: {
    ON: { operation: "OFF" }
  },
  valve: {
    OPEN: { operation: "CLOSE" }
  },
  heater: {
    ON: { operation: "OFF" }
  }
};

function getRollbackCommand(command) {
  if (!command.payload?.target || !command.payload?.operation) {
    return null;
  }

  const target = command.payload.target.toLowerCase();
  const operation = command.payload.operation.toUpperCase();

  const policy = rollbackPolicy[target]?.[operation];

  if (!policy) return null;

  return {
    deviceId: command.deviceId,
    source: "SYSTEM",
    payload: {
      target,
      operation: policy.operation
    }
  };
}

module.exports = {
  getRollbackCommand
};