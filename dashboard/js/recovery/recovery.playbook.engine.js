import { PLAYBOOK_RULES, PLAYBOOK_ACTIONS } from "./recovery.playbook.rules.js";
import { getActionWeight } from "./playbook/recovery.playbook.weight.store.js";
import { isActionSuppressed }  from "./playbook/recovery.playbook.outcome.store.js";

  // 🔍 Explain helper (SAFE, non-intrusive)
function explainPlaybookRule(rule, incident, matched) {
  return {
    ruleId: rule.id,
    matched,
    evaluatedAt: Date.now(),
    snapshot: {
      status: incident.status,
      severity: incident.severity,
      retryCount: incident.retryCount,
      durationMs: incident.durationMs
    },
    risk: rule.risk || "unknown"
  };
}

  /**
 * Resolve suggested playbook actions for an incident
 * @param {Object} incident
 * @returns {Array} suggested actions with metadata
 */
export function resolvePlaybookActions(incident) {
  if (!incident) return [];

  const suggestions = [];

  for (const rule of PLAYBOOK_RULES) {
  let matched = false;

  try {
    matched = rule.when(incident);
  } catch (e) {
    console.warn("[Playbook] rule failed:", rule.id, e);
    continue;
  }

  // 🔍 explain snapshot (even if not matched)
  const explain = explainPlaybookRule(
    rule,
    incident,
    matched
  );

  if (!matched) continue;

  for (const action of rule.actions) {
    if (isActionSuppressed(action)) continue;

    suggestions.push({
      action,
      ruleId: rule.id,
      risk: rule.risk || "unknown",

      // 🔒 optional explain (new)
      explain
    });
  }
}


return dedupeActions(suggestions)
  .map(a => ({
    ...a,
    weight: getActionWeight(a.action)
  }))
  .sort((a, b) => b.weight - a.weight);
}

function dedupeActions(actions) {
  const map = new Map();

  for (const a of actions) {
    if (!map.has(a.action)) {
      map.set(a.action, a);
    }
  }

  return Array.from(map.values());
}

// expose for UI / non-module usage
window.resolvePlaybookActions = resolvePlaybookActions;
