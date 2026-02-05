import {
  getGovernancePolicyHistory,
  rollbackGovernancePolicy
} from "../system/governance.policy.store.js";
import { canRollbackPolicy } from "../system/rbac.guard.js";

export function GovernancePolicyHistory() {
  const history = getGovernancePolicyHistory();

  if (!history.length) {
    return `<div>No policy history</div>`;
  }

  return `
    <div class="policy-history">
      <h4>📜 Policy History</h4>

      <ul>
        ${history
          .map(
            (h, i) => `
              <li>
                <span>
                  ${new Date(h.time).toLocaleString()}
                </span>
                ${
                  canRollbackPolicy()
                  ? `
                 <button
                 onclick="window.rollbackPolicy(${i})"
                 >
                Rollback
               </button>
                `
              : `<span class="locked">🔒 Admin only</span>`
               }
              </li>
            `
          )
          .join("")}
      </ul>
    </div>
  `;
}

window.rollbackPolicy = index => {
  rollbackGovernancePolicy(index);
  alert("Policy rolled back");
};
