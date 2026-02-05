import { getSuppressionHistory } from "./recovery.playbook.outcome.store.js";

export function renderSuppressionHistory(container) {
  const history = getSuppressionHistory();

  if (!history.length) {
    container.innerHTML = "✅ No suppressed actions";
    return;
  }

  container.innerHTML = `
    <h4>🚫 Suppressed Actions</h4>
    <ul class="suppression-list">
      ${history.map(h => `
        <li>
          <b>${h.action}</b>
          <br/>
          Reason: ${h.reason}
          <br/>
          Weight: ${h.weight ?? "—"}
          <br/>
          Since: ${new Date(h.suppressedAt).toLocaleString()}
          ${h.recoveredAt
            ? `<br/>Recovered: ${new Date(h.recoveredAt).toLocaleString()}`
            : `<span class="badge">ACTIVE</span>`
          }
        </li>
      `).join("")}
    </ul>
  `;
}
