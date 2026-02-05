import { getGovernancePolicy, updateGovernancePolicy } from "../system/governance.policy.store.js";
import { GovernancePolicyHistory } from "./governance.policy.history.js";
import { canEditPolicy } from "../system/rbac.guard.js";

export function GovernancePolicyEditor() {
     // 🔒 RBAC: Admin only
  if (!canEditPolicy()) {
    return `
      <div class="governance-policy-editor locked">
        🔒 Policy editing requires ADMIN role
      </div>
    `;
  }

  const policy = getGovernancePolicy();

  return `
    <div class="governance-policy-editor">
      <h3>🛠 Governance Policy</h3>

      <fieldset>
        <legend>Auto-Action</legend>

        <label>
          Max Failure Rate for Override (%)
          <input type="number"
            min="0" max="100"
            value="${policy.autoAction.maxFailureRateForOverride}"
            onchange="window.updatePolicy('autoAction.maxFailureRateForOverride', this.value)"
          />
        </label>

        <label>
          Predictive Sensitivity
          <select
            onchange="window.updatePolicy('autoAction.predictiveBlockSensitivity', this.value)"
          >
            ${["LOW","MEDIUM","HIGH"].map(
              v => `<option ${v === policy.autoAction.predictiveBlockSensitivity ? "selected":""}>${v}</option>`
            ).join("")}
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>Override</legend>

        <label>
          Min Trust for Long Override
          <input type="number"
            min="0" max="100"
            value="${policy.override.minTrustForLongOverride}"
            onchange="window.updatePolicy('override.minTrustForLongOverride', this.value)"
          />
        </label>

        <label>
          Max Override (Low Trust, minutes)
          <input type="number"
            min="1" max="30"
            value="${policy.override.maxOverrideMinutesLowTrust}"
            onchange="window.updatePolicy('override.maxOverrideMinutesLowTrust', this.value)"
          />
        </label>
      </fieldset>
    </div>

    ${GovernancePolicyHistory()}
  `;
}

// expose updater
window.updatePolicy = (path, value) => {
  const [group, key] = path.split(".");
  updateGovernancePolicy({
    [group]: {
      [key]: isNaN(value) ? value : Number(value)
    }
  });
};
