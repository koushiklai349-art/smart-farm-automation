import { getSystemMode, SYSTEM_MODE } from "../recovery/recovery.state.js";
import { getSystemHealthScore } from "../health/system.health.js";
import { calculateOperatorTrustScore } from "../system/operator.trust.engine.js";
import { isOperatorOverrideActive,getOperatorOverrideInfo} from "../system/operator.override.state.js";
import { getLastAutoActionBlock } from "../audit/auto.action.audit.selector.js";
import { showPostMortem } from "./incident.postmortem.viewer.js";
import { canViewPostMortem } from "../system/rbac.guard.js";
import {
  exportGovernanceReportJSON,
  exportGovernanceReportCSV
} from "../system/governance.report.exporter.js";

function modeLabel(mode) {
  switch (mode) {
    case SYSTEM_MODE.STABLE:
      return "🟢 Stable";
    case SYSTEM_MODE.DEGRADED:
      return "🟡 Degraded";
    case SYSTEM_MODE.RECOVERING:
      return "🔵 Recovering";
    case SYSTEM_MODE.CRITICAL:
      return "🔴 Critical";
    default:
      return "⚪ Unknown";
  }
}

export function GovernanceSummaryPanel() {
  const mode = getSystemMode();
  const healthScore = getSystemHealthScore();
  const { score: trustScore } = calculateOperatorTrustScore();
  const overrideActive = isOperatorOverrideActive();
  const overrideInfo = getOperatorOverrideInfo();
  const lastRisk = getLastAutoActionBlock?.();

  return `
    <div class="governance-summary-panel">
      <h3>🧭 Governance Summary</h3>

      <div class="gov-row">
        <span>System Mode</span>
        <b>${modeLabel(mode)}</b>
      </div>
    
      <div class="gov-row">
        <span>Health Score</span>
        <b>${healthScore}/100</b>
      </div>

      <div class="gov-row">
        <span>Operator Trust</span>
        <b>${trustScore}/100</b>
      </div>

      <div class="gov-row">
        <span>Override</span>
        <b>
          ${
            overrideActive
              ? `🧑‍💼 Active (${Math.ceil(
                  (overrideInfo.until - Date.now()) / 60000
                )} min left)`
              : "—"
          }
        </b>
      </div>

      <div class="gov-row">
        <span>Recent Risk</span>
        <b>
          ${
            lastRisk
              ? lastRisk.reason.replace(/_/g, " ")
              : "None"
          }
        </b>
      </div>
      ${
    canViewPostMortem()
     ? `
      <div class="gov-row">
        <button
          class="postmortem-btn"
          onclick="window.generatePostMortem()"
        >
          📄 Generate Incident Post-Mortem
        </button>
      </div>
    `
    : ""
}
<div class="gov-row">
  <button onclick="exportGovernanceReportJSON()">
    ⬇ Export Governance Report (JSON)
  </button>

  <button onclick="exportGovernanceReportCSV()">
    ⬇ Export Governance Summary (CSV)
  </button>
</div>

  `;
}

window.generatePostMortem = () => {
  // last 6 hours incident window
  const sixHoursAgo =
    Date.now() - 6 * 60 * 60 * 1000;

  showPostMortem(sixHoursAgo);
};
