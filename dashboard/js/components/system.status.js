// dashboard/js/components/system.status.js
import { store } from "../store.js";
import {getSystemMode,SYSTEM_MODE} from "../recovery/recovery.state.js";
import { SystemStabilityMeter } from "./system.stability.meter.js";
import { SystemStabilityTrendGraph } from "./system.stability.trend.graph.js";
import { SystemStabilityForecast } from "./system.stability.forecast.js";
import { OperatorOverrideBanner } from "./operator.override.banner.js";
import { OperatorTrustCard } from "./operator.trust.card.js";
import { GovernanceSummaryPanel } from "./governance.summary.panel.js";
import { SimulationPanel } from "./simulation.panel.js";
import { SimulationComparePanel } from "./simulation.compare.panel.js";
import { canSimulate,canOverride } from "../system/rbac.guard.js";


// 🔒 TASK-108: track last system block time
let lastBlockedAt = null;
let lastMode = null;

export function SystemStatus() {
  const system = store.system || {};
    // 🚨 TASK-104: authoritative system mode
  const systemMode = getSystemMode();
    // 🕒 Track last system block event
  if (systemMode !== SYSTEM_MODE.STABLE && lastMode !== systemMode) {
    lastBlockedAt = new Date().toLocaleTimeString();
  }

  lastMode = systemMode;

  const health = system.health || "unknown";
  const power = system.power || "unknown";
  const network = system.network || "unknown";
  const lastUpdate = system.lastUpdate
    ? new Date(system.lastUpdate).toLocaleTimeString()
    : "N/A";
    let modeLabel = "UNKNOWN";
  let modeIcon = "⚪";

  switch (systemMode) {
    case SYSTEM_MODE.STABLE:
      modeLabel = "System Stable";
      modeIcon = "🟢";
      break;

    case SYSTEM_MODE.DEGRADED:
      modeLabel = "System Degraded – Automation Paused";
      modeIcon = "🟡";
      break;

    case SYSTEM_MODE.RECOVERING:
      modeLabel = "Recovery Running";
      modeIcon = "🔵";
      break;

    case SYSTEM_MODE.CRITICAL:
      modeLabel = "Critical – Manual Attention Needed";
      modeIcon = "🔴";
      break;
  }
    // 🚨 TASK-108: system block reason
  let blockReason = null;
   
  if (systemMode === SYSTEM_MODE.DEGRADED) {
    blockReason = "Automation paused due to degraded system health";
  } else if (systemMode === SYSTEM_MODE.RECOVERING) {
    blockReason = "System recovery is currently in progress";
  } else if (systemMode === SYSTEM_MODE.CRITICAL) {
    blockReason = "Critical failures detected – manual intervention required";
  }
    const blockTimeText =
    blockReason && lastBlockedAt
      ? `Last blocked at ${lastBlockedAt}`
      : null;
  
    // 🚀 TASK-108: resume condition hint
  let resumeHint = null;

  if (systemMode === SYSTEM_MODE.DEGRADED) {
    resumeHint = "Automation will resume automatically when system health improves";
  } else if (systemMode === SYSTEM_MODE.RECOVERING) {
    resumeHint = "Automation will resume after recovery completes";
  } else if (systemMode === SYSTEM_MODE.CRITICAL) {
    resumeHint = "Manual intervention required to resume automation";
  }
 
  // 🧠 Confidence logic (simple & explainable)
  let confidence = "HIGH";
  if (health !== "good" || network !== "online") {
    confidence = "MEDIUM";
  }
  if (health === "bad" || power === "off") {
    confidence = "LOW";
  }

  return `
     ${GovernanceSummaryPanel()}
     ${canSimulate() ? SimulationPanel() : ""}
     ${canSimulate() ? SimulationComparePanel() : ""}
     ${canOverride() ? OperatorOverrideBanner() : ""}
     ${SystemStabilityMeter()}
     ${SystemStabilityTrendGraph()}
     ${SystemStabilityForecast()}
     ${OperatorTrustCard()}

    <div class="system-status health-${health} confidence-${confidence.toLowerCase()}">
      <span>${modeIcon} Mode: <b>${modeLabel}</b></span>
       ${
        blockReason
          ? `<span class="system-block-reason">⚠️ ${blockReason}</span>`
          : ""
      }
            ${
        blockTimeText
          ? `<span class="system-block-time">🕒 ${blockTimeText}</span>`
          : ""
      }
            ${
        resumeHint
          ? `<span class="system-resume-hint">▶️ ${resumeHint}</span>`
          : ""
      }

      <span>🧠 Health: <b>${health.toUpperCase()}</b></span>
      <span>⚡ Power: <b>${power.toUpperCase()}</b></span>
      <span>🌐 Network: <b>${network.toUpperCase()}</b></span>
      <span>🛡 Confidence: <b>${confidence}</b></span>
      <span>⏱ Updated: ${lastUpdate}</span>
    </div>
  `;
}
