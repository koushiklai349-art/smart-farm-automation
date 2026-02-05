
const rules = [];

export function addRule(rule) {
  rules.push({
    id: rule.id || crypto.randomUUID(),
    enabled: rule.enabled !== false,
    createdAt: Date.now(),
    ...rule
  });
}

export function getActiveRules() {
  return rules.filter(r => r.enabled);
}
