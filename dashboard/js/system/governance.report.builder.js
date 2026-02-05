import { getSystemMode } from "../recovery/recovery.state.js";
import { getSystemHealthScore } from "../health/system.health.js";
import { calculateOperatorTrustScore } from "./operator.trust.engine.js";
import { isOperatorOverrideActive, getOperatorOverrideInfo } from "./operator.override.state.js";
import { getGovernancePolicy, getGovernancePolicyHistory } from "./governance.policy.store.js";
import { getLastAutoActionBlock } from "../audit/auto.action.audit.selector.js";
import { getDailyRecoverySummary } from "../recovery/recovery.timeline.store.js";

export function buildGovernanceReport() {
  const mode = getSystemMode();
  const healthScore = getSystemHealthScore();
  const { score: trustScore } = calculateOperatorTrustScore();

  const overrideActive = isOperatorOverrideActive();
  const overrideInfo = getOperatorOverrideInfo();

  return {
    generatedAt: new Date().toISOString(),

    system: {
      mode,
      healthScore,
      operatorTrustScore: trustScore
    },

    override: {
      active: overrideActive,
      ...(overrideInfo || {})
    },

    policy: {
      current: getGovernancePolicy(),
      historyCount: getGovernancePolicyHistory().length
    },

    risk: getLastAutoActionBlock() || null,

    recovery: getDailyRecoverySummary(24)
  };
}
