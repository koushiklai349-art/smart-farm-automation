import { load, save } from "../utils/persist.js";
import { addAuditEntry } from "../audit/audit.history.js";

const KEY = "governance.policy";

const HISTORY_KEY = "governance.policy.history";
const MAX_HISTORY = 10;

const DEFAULT_POLICY = {
  autoAction: {
    maxFailureRateForOverride: 40,
    predictiveBlockSensitivity: "MEDIUM" // LOW | MEDIUM | HIGH
  },
  override: {
    minTrustForLongOverride: 80,
    maxOverrideMinutesLowTrust: 2
  }
};

let policy = load(KEY, DEFAULT_POLICY);
let policyHistory = load(HISTORY_KEY, []);

export function getGovernancePolicy() {
  return JSON.parse(JSON.stringify(policy));
}

export function updateGovernancePolicy(partial, source = "OPERATOR") {
  // save current policy to history before change
  policyHistory.unshift({
    policy,
    time: Date.now()
  });

  if (policyHistory.length > MAX_HISTORY) {
    policyHistory.pop();
  }

  policy = {
    ...policy,
    ...partial
  };

  save(KEY, policy);
  save(HISTORY_KEY, policyHistory);

  addAuditEntry({
    type: "GOVERNANCE_POLICY",
    action: "UPDATE",
    source,
    policy: partial,
    time: Date.now()
  });

  return getGovernancePolicy();
}

export function rollbackGovernancePolicy(index = 0) {
  const snapshot = policyHistory[index];
  if (!snapshot) return null;

  policy = snapshot.policy;

  save(KEY, policy);

  addAuditEntry({
    type: "GOVERNANCE_POLICY",
    action: "ROLLBACK",
    source: "OPERATOR",
    rolledBackTo: snapshot.time,
    time: Date.now()
  });

  return getGovernancePolicy();
}

export function getGovernancePolicyHistory() {
  return [...policyHistory];
}

