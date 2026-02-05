// /core/alert/alert.manager.js
import { isQuarantined } from "../../recovery/device.quarantine.js";
import { auditStore } from "../../audit/audit.store.js";
import { canSendAlert } from "./alert.throttle.js";
import { getHealthTrendSlope } from "../../health/system.health.js";
import { getRecoverySuccessRateLast24h } from "../../audit/metrics.store.js";
import { getRecoveryDurations } from "../../recovery/recovery.timeline.store.js";
import { groupAlert } from "./alert.group.engine.js";
import { cleanupThrottle } from "./alert.throttle.js";
import { cleanupAlertGroups } from "./alert.group.engine.js";
import { handleAutoActionAlert } from "../../auto-action/auto.action.engine.js";
import { evaluateEscalation } from "./alert.escalation.engine.js";
import { computeEscalatedSeverity } from "./alert.escalation.engine.js";
import { mapAlertToGovernanceImpact } from "./alert.governance.mapper.js";
import { applyGovernanceImpact }  from "../../governance/governance.engine.js";


const HEALTH_FAST_DROP_SLOPE = -0.05; // score per second
const ALERT_DEBOUNCE_MS = 60_000; // 1 min
const HEALTH_BAD_THRESHOLD = 40;
const HEALTH_RECOVER_THRESHOLD = 60;
const RECOVERY_SUCCESS_WARN_THRESHOLD = 70; // %
const RECOVERY_AVG_CRITICAL_MS = 3 * 60 * 1000; // 3 min

let lastAlertAt = 0;
let healthState = "ok"; // ok | bad

function escalateSeverityIfNeeded(groupedAlert) {
  if (
    groupedAlert.count >= 3 &&
    groupedAlert.severity === "warning"
  ) {
    return "critical";
  }
  return groupedAlert.severity;
}

/**
 * Generic alert raiser
 */
export function raiseAlert(type, context = {}) {
  const key = `${type.code}_${context.deviceId || "system"}`;

  // 🚫 spam block
  if (!canSendAlert(key)) return;

  const alert = {
    code: type.code,
    severity: type.severity,
    message: type.message,
    context,
    timestamp: Date.now()
  };

    // 🔕 TASK-138: smart grouping & dedup
  const { grouped, alert: groupedAlert } =
    groupAlert(type, context);

    const decision = evaluateEscalation(groupedAlert, context);
   if (decision) {
        console.log(
       "[ESCALATION][LOG]",
       groupedAlert.code,
       context.deviceId || "SYSTEM",
      decision
    );
   }


  // audit log (always log raw alert)
  auditStore.log({
    type: "ALERT",
    ...alert
  });

  // already grouped → just count, no UI spam
  if (grouped) {
    return;
  }

  // dispatch only first alert in group
  const finalSeverity =
  computeEscalatedSeverity(groupedAlert);


  // 🔄 lifecycle maintenance (cheap & safe)
  cleanupThrottle();
  cleanupAlertGroups();

  dispatchAlertToUI({
  ...groupedAlert,
  severity: finalSeverity,
  timestamp: Date.now()
  });
  handleAutoActionAlert(alert);
  
  const impacts = mapAlertToGovernanceImpact(groupedAlert);

if (impacts.length > 0) {
  impacts.forEach(impact => {
    applyGovernanceImpact({
      ...impact,
      alertCode: groupedAlert.code,
      deviceId: context.deviceId || null,
      at: Date.now()
    });
  });
} else {
  // default fallback
  applyGovernanceImpact({
    type: "ALERT",
    weight:
      finalSeverity === "critical" ? -3 :
      finalSeverity === "warning"  ? -1 : 0,
    alertCode: groupedAlert.code,
    deviceId: context.deviceId || null,
    at: Date.now()
  });
}


}

/**
 * 🟡 Phase-9.4
 * Device confidence degrading → soft warning
 */
export function raiseConfidenceWarning(deviceId, data = {}) {
  if (!deviceId) return;

  raiseAlert(
    {
      code: "DEVICE_CONFIDENCE_DOWN",
      severity: "warning",
      message: "Device confidence is degrading"
    },
    {
      deviceId,
      ...data
    }
  );
}

// 🔗 UI hook
function dispatchAlertToUI(alert) {
  window.dispatchEvent(
    new CustomEvent("ALERT_EVENT", { detail: alert })
  );
}

/**
 * Health score alert (unchanged)
 */
export function alertOnHealthScore(score, deviceId = null) {
  if (deviceId && isQuarantined(deviceId)) return;

  const now = Date.now();
  if (now - lastAlertAt < ALERT_DEBOUNCE_MS) return;

  const slope = getHealthTrendSlope();

  if (healthState === "ok" && slope <= HEALTH_FAST_DROP_SLOPE) {
    raiseAlert(
      {
        code: "HEALTH_FAST_DROP",
        severity: "warning",
        message: "System health degrading rapidly"
      },
      { score, slope, deviceId }
    );
    lastAlertAt = now;
    return;
  }

  if (healthState === "ok" && score <= HEALTH_BAD_THRESHOLD) {
    raiseAlert(
      {
        code: "HEALTH_DEGRADED",
        severity: "critical",
        message: "System health degraded"
      },
      { score, deviceId }
    );
    healthState = "bad";
    lastAlertAt = now;
    return;
  }

  if (healthState === "bad" && score >= HEALTH_RECOVER_THRESHOLD) {
    raiseAlert(
      {
        code: "HEALTH_RECOVERED",
        severity: "info",
        message: "System health recovered"
      },
      { score, deviceId }
    );
    healthState = "ok";
    lastAlertAt = now;
  }
}


/**
 * 🔔 TASK-81: Auto alert on recovery performance
 */
export function alertOnRecoveryPerformance() {
  const { start, success, rate } =
    getRecoverySuccessRateLast24h();

  // ⚠️ Low success rate warning
  if (start > 0 && rate < RECOVERY_SUCCESS_WARN_THRESHOLD) {
    raiseAlert(
      {
        code: "RECOVERY_SUCCESS_LOW",
        severity: "warning",
        message: "Recovery success rate is low (last 24h)"
      },
      { start, success, rate }
    );
  }

  // 🚨 Slow recovery critical
  const durations = getRecoveryDurations();
  if (durations.length > 0) {
    const avg =
      durations.reduce((a, d) => a + d.durationMs, 0) /
      durations.length;

    if (avg > RECOVERY_AVG_CRITICAL_MS) {
      raiseAlert(
        {
          code: "RECOVERY_TOO_SLOW",
          severity: "critical",
          message: "Average recovery time is too high"
        },
        { avgMs: Math.round(avg) }
      );
    }
  }
}

// ✅ alias export for auto-action compatibility
export const alertManager = {
  raise: raiseAlert,
  warn: raiseAlert,
  error: raiseAlert
};
