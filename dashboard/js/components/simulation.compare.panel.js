import {
  comparePolicies
} from "../system/simulation.compare.engine.js";
import {
  getGovernancePolicy
} from "../system/governance.policy.store.js";

export function SimulationComparePanel() {
  const currentPolicy = getGovernancePolicy();

  // clone & tweak example
  const strictPolicy = {
    ...currentPolicy,
    autoAction: {
      ...currentPolicy.autoAction,
      predictiveBlockSensitivity: "HIGH"
    }
  };

  return `
    <div class="simulation-compare-panel">
      <h3>🧪 Policy Comparison</h3>

      <label>
        Mock Risk
        <select id="cmp-risk">
          <option value="">Auto</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>

      <button onclick="window.runPolicyCompare()">
        Compare Policies
      </button>

      <pre id="cmp-result"></pre>
    </div>
  `;
}

window.runPolicyCompare = () => {
  const risk =
    document.getElementById("cmp-risk").value || null;

  const basePolicy = getGovernancePolicy();

  const strictPolicy = {
    ...basePolicy,
    autoAction: {
      ...basePolicy.autoAction,
      predictiveBlockSensitivity: "HIGH"
    }
  };

  const result = comparePolicies({
    policyA: basePolicy,
    policyB: strictPolicy,
    mockRisk: risk
  });

  document.getElementById("cmp-result").textContent =
    JSON.stringify(result, null, 2);
};

