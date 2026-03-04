function normalizePayload(payload) {
  if (payload.target && payload.operation) {
    return payload;
  }

  if (payload.action) {
    const [target, operationRaw] = payload.action.split("_");

    return {
      target,
      operation: operationRaw?.toUpperCase()
    };
  }

  return payload;
}

module.exports = {
  normalizePayload
};