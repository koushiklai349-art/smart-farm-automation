// dashboard/js/rules/rule.model.js
export function createRule({
  id,
  deviceId,
  action,
  sourceKey,     // e.g. "temp", "waterLevel"
  operator,      // ">" "<" "==" ">=" "<="
  value,
  enabled = true
}) {
  return {
    id: id || crypto.randomUUID(),
    deviceId,
    action,
    sourceKey,
    operator,
    value,
    enabled,
    lastTriggeredAt: null,
    createdAt: Date.now()
  };
}
