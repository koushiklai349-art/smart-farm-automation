// explain.panel.js
import { getAutoExplainEvents,getTrustExplain } from "../explain/explain.store.js";

export function ExplainPanel() {
  const events = getAutoExplainEvents();
  const trust = getTrustExplain();

  if ((!events || events.length === 0) && trust.length === 0) {
    return `
      <div class="card">
        <h3>🤖 Automation Explain</h3>
        <div class="hint">No automation or prediction yet</div>
      </div>
    `;
  }

  return `
    <div class="card">
      <h3>🤖 Automation Explain</h3>

      ${
        events && events.length > 0
          ? `
        <ul style="list-style:none;padding:0;margin:0;">
          ${events
            .slice(0, 5)
            .map(
              e => `
              <li style="margin-bottom:8px;">
                <strong>${e.target.toUpperCase()} ${e.action}</strong>

                <div class="hint">
                  Rule: ${e.ruleId}<br/>
                  Reason: ${e.reason}
                </div>

                ${
                  e.commandId
                    ? `<div class="hint">
                        Command: <code>${e.commandId.slice(0, 8)}…</code>
                      </div>`
                    : ""
                }
              </li>
            `
            )
            .join("")}
        </ul>
      `
          : `<div class="hint">No automation actions yet</div>`
      }

      ${
        trust.length > 0
          ? `
        <hr/>
        <h4>🔮 Predictive Risk Explain</h4>
        <ul>
          ${trust
            .map(
              t => `
              <li>
                <strong>${t.deviceId}</strong> —
                score ${t.score},
                slope ${t.slope}<br/>
                <span class="hint">${t.reason}</span>
              </li>
            `
            )
            .join("")}
        </ul>
      `
          : ""
      }
    </div>
  `;
}
