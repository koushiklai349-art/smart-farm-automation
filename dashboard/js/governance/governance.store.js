// js/governance/governance.store.js

const _governanceLog = [];
const _impactLog = [];

// 🔹 existing
export function logGovernance(entry) {
  _governanceLog.push(entry);
}

export function getGovernanceLog() {
  return _governanceLog;
}

// ✅ ADD THIS (Phase 8 requirement)
export const governanceStore = {
  recordImpact(impact) {
    _impactLog.push({
      ...impact,
      at: impact.at || Date.now()
    });
  },

  getImpacts() {
    return _impactLog;
  }
};
