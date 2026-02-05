import { computePlaybookEffectiveness } from "../recovery/playbook/recovery.playbook.effectiveness.js";
import { getPlaybookOutcomes } from "../recovery/playbook/recovery.playbook.outcome.store.js";

export function PlaybookEffectivenessCard() {
  const data = computePlaybookEffectiveness();
  const outcomes = getPlaybookOutcomes();

  const hasExplain =
  outcomes.some(
    o => o?.meta?.explain
  );

  const actions = Object.keys(data);

  if (actions.length === 0) {
    return `
      <div class="card">
        <h3>
  🧠 Playbook Effectiveness
  ${hasExplain ? `
    <span class="explain-badge">
      ✔ Explainable decisions
    </span>
  ` : ""}
</h3>

        <div class="empty-state">
          No playbook actions executed yet
        </div>
      </div>
    `;
  }

  return `
    <div class="card">
      <h3>🧠 Playbook Effectiveness</h3>

      <table class="effectiveness-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Total</th>
            <th>Success</th>
            <th>Failed</th>
            <th>No Effect</th>
            <th>Success %</th>
          </tr>
        </thead>
        <tbody>
          ${actions.map(action => {
            const a = data[action];
            return `
              <tr>
                <td>${action}</td>
                <td>${a.total}</td>
                <td>${a.SUCCESS}</td>
                <td>${a.FAILED}</td>
                <td>${a.NO_EFFECT}</td>
                <td>${a.successRate}%</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}
