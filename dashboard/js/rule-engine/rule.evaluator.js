// dashboard/js/rule-engine/rule.evaluator.js

function _evaluate(condition, sensorValue) {
  switch (condition.operator) {
    case ">":  return sensorValue > condition.value;
    case "<":  return sensorValue < condition.value;
    case ">=": return sensorValue >= condition.value;
    case "<=": return sensorValue <= condition.value;
    case "==": return sensorValue === condition.value;
    default:   return false;
  }
}

export function evaluateRule(rule, sensorData) {
  const { sensor, operator, value } = rule.when;
  const current = sensorData[sensor];

  if (current === undefined) return false;

  return _evaluate({ operator, value }, current);
}

/**
 * 🔍 Explainable rule evaluation
 */
export function evaluateRuleWithExplain(rule, sensorData) {
  const { sensor, operator, value } = rule.when;
  const current = sensorData[sensor];

  if (current === undefined) {
    return {
      matched: false,
      explain: {
        ruleId: rule.id,
        sensor,
        operator,
        expected: value,
        actual: undefined,
        result: false,
        reason: "SENSOR_VALUE_MISSING"
      }
    };
  }

  const result = _evaluate({ operator, value }, current);

  return {
    matched: result,
    explain: {
      ruleId: rule.id,
      sensor,
      operator,
      expected: value,
      actual: current,
      result
    }
  };
}
