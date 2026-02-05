// dashboard/js/recovery/recovery.timeline.store.js
import { auditStore } from "../audit/audit.store.js";
import { RETENTION_DAYS,getRetentionCutoff} from "../system/retention.config.js";
import { onSystemModeChange } from "./recovery.state.js";


export const RECOVERY_TIMELINE_TYPES = {
  FAILURE: "FAILURE",
  RETRY: "RETRY",
  QUARANTINED: "QUARANTINED",
  MANUAL_RELEASE: "MANUAL_RELEASE",
  RECOVERED: "RECOVERED",
  SYSTEM_MODE: "SYSTEM_MODE",
  SLA_BREACH: "SLA_BREACH",
  OPERATOR_OVERRIDE: "OPERATOR_OVERRIDE"
};
// 🆕 TASK-111: SLA breach timeline buffer
const slaTimeline = [];
// 🆕 TASK-109: system mode timeline buffer
const systemModeTimeline = [];
// 🆕 TASK-109: capture system mode changes
onSystemModeChange(({ from, to, time, reason }) => {

  systemModeTimeline.push({
    ts: time,
    type: RECOVERY_TIMELINE_TYPES.SYSTEM_MODE,
    refId: "SYSTEM",
    message: reason
  ? `System mode changed: ${from} → ${to} (${reason})`
  : `System mode changed: ${from} → ${to}`,

    meta: { from, to }
  });
});

// 🆕 TASK-111: record SLA breach in timeline
export function recordSLATimelineEvent({
  level,
  deviceId,
  durationMs
}) {
  slaTimeline.push({
    ts: Date.now(),
    type: RECOVERY_TIMELINE_TYPES.SLA_BREACH,
    refId: deviceId || "SYSTEM",
    message: `Recovery SLA breached (${level.toUpperCase()}) · ${Math.round(durationMs / 1000)}s`,
    meta: {
      level,
      durationMs
    }
  });
}

/**
 * Normalize audit log → timeline event
 */
function fromAuditLog(log) {
  if (!log || !log.at) return null;

  const ts = new Date(log.at).getTime();

  // Failure
  if (log.type === "FAILURE") {
    return {
      ts,
      type: RECOVERY_TIMELINE_TYPES.FAILURE,
      refId: log.refId || log.deviceId,
      message: log.reason || "Failure detected",
      meta: log
    };
  }

  // Retry
  if (log.type === "RETRY") {
    return {
      ts,
      type: RECOVERY_TIMELINE_TYPES.RETRY,
      refId: log.refId || log.deviceId,
      message: "Retry attempt",
      meta: log
    };
  }
 // Quarantined
if (log.type === "QUARANTINED") {
  return {
    ts,
    type: RECOVERY_TIMELINE_TYPES.QUARANTINED,
    refId: log.deviceId,
    message: "Device quarantined",
    meta: log
  };
}

// Manual release
if (log.type === "MANUAL_RELEASE") {
  return {
    ts,
    type: RECOVERY_TIMELINE_TYPES.MANUAL_RELEASE,
    refId: log.deviceId,
    message: "Device released from quarantine",
    meta: log
  };
}

  // Recovery success (from auto action audit)
  if (
    log.stage === "RECOVERY_SUCCESS" ||
    log.action === "RECOVERY"
  ) {
    return {
      ts,
      type: RECOVERY_TIMELINE_TYPES.RECOVERED,
      refId: log.deviceId,
      message: "Device recovered successfully",
      meta: log
    };
  }
 // 🧑‍💼 Operator Override events
 if (log.type === "OPERATOR_OVERRIDE") {
  let message = "Operator override";

  if (log.action === "ENABLE") {
    message = "Operator override enabled";
  } else if (log.action === "DISABLE") {
    message = "Operator override disabled by operator";
  } else if (log.action === "EXPIRED") {
    message = "Operator override auto-expired";
  }

  return {
    ts: log.startedAt || log.endedAt || Date.now(),
    type: RECOVERY_TIMELINE_TYPES.OPERATOR_OVERRIDE,
    refId: "SYSTEM",
    message,
    meta: log
  };
 }
  return null;
}
function groupTimelineEvents(events) {
  if (!events.length) return events;

  const grouped = [];
  let prev = null;

  for (const curr of events) {
    if (
      prev &&
      prev.type === curr.type &&
      prev.refId === curr.refId
    ) {
      // same type + same device → group
      prev.count = (prev.count || 1) + 1;

      // keep the latest timestamp (since sorted desc)
      prev.ts = Math.max(prev.ts, curr.ts);
    } else {
      // push new group
      grouped.push({
        ...curr,
        count: 1
      });
      prev = grouped[grouped.length - 1];
    }
  }

  return grouped;
}

/**
 * Build recovery timeline (read-only)
 */
export function getRecoveryTimeline(deviceId = null) {
  const timeline = [];

  // ✅ system + SLA timeline (retention applied)
  timeline.push(
    ...systemModeTimeline.filter(e => isWithinRetention(e.ts))
  );
  timeline.push(
    ...slaTimeline.filter(e => isWithinRetention(e.ts))
  );

  const auditLogs = auditStore.getAll();

  for (const log of auditLogs) {
    const event = fromAuditLog(log);
    if (!event) continue;

    // 🔒 retention
    if (!isWithinRetention(event.ts)) continue;

    // 🔍 device filter
    if (deviceId) {
      const logDeviceId =
        log.deviceId || log.refId || event.refId;
      if (logDeviceId !== deviceId) continue;
    }

    timeline.push(event);
  }

  // newest first
  timeline.sort((a, b) => b.ts - a.ts);

  return groupTimelineEvents(timeline);
}

export function getRecoveryDurations() {
  const events = getRecoveryTimeline();
  const map = {};
  const durations = [];

  for (const e of events) {
    if (!e.refId) continue;
    if (!isWithinRetention(e.ts)) continue;

    if (e.type === "FAILURE") {
      map[e.refId] = e.ts;
    }

   if (e.type === "RECOVERED" && map[e.refId]) {
  const durationMs = e.ts - map[e.refId];

  durations.push({
    deviceId: e.refId,
    durationMs,
    recoveredAt: e.ts
  });

  delete map[e.refId]; // reset after success
}

  }

  return durations;
}

export function getDailyRecoverySummary(hours = 24) {
  const since = Date.now() - hours * 60 * 60 * 1000;

  const events = getRecoveryTimeline();
  const summary = {
    attempts: 0,
    success: 0,
    successRate: 0,
    avgRecoveryMs: 0,
    topFailingDevices: []
  };

  const failureCountByDevice = {};
  const durationList = [];

  for (const e of events) {
    if (e.ts < since) continue;

    // attempt = recovery start inferred from FAILURE
    if (e.type === "FAILURE") {
      summary.attempts++;
      failureCountByDevice[e.refId] =
        (failureCountByDevice[e.refId] || 0) + 1;
    }

    if (e.type === "RECOVERED") {
      summary.success++;
    }
  }

  // durations (reuse existing helper)
  const durations = getRecoveryDurations();
  for (const d of durations) {
    if (d.recoveredAt >= since) {
      durationList.push(d.durationMs);
    }
  }

  if (durationList.length > 0) {
    summary.avgRecoveryMs =
      durationList.reduce((a, b) => a + b, 0) /
      durationList.length;
  }

  if (summary.attempts > 0) {
    summary.successRate = Math.round(
      (summary.success / summary.attempts) * 100
    );
  }

  // top failing devices (sorted)
  summary.topFailingDevices = Object.entries(
    failureCountByDevice
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([deviceId, count]) => ({ deviceId, count }));

  return summary;
}

function isWithinRetention(ts) {
  const cutoff = getRetentionCutoff(RETENTION_DAYS.RECOVERY);
  return ts >= cutoff;
}
// 🔒 TASK-88B: export recovery analytics as CSV
export function exportRecoveryAnalyticsCSV(hours = 24) {
  const summary = getDailyRecoverySummary(hours);

  const rows = [
    { key: "Attempts", value: summary.attempts },
    { key: "Success", value: summary.success },
    { key: "Success Rate (%)", value: summary.successRate },
    { key: "Avg Recovery Time (ms)", value: Math.round(summary.avgRecoveryMs) }
  ];

  summary.topFailingDevices.forEach((d, i) => {
    rows.push({
      key: `Top Failing #${i + 1}`,
      value: `${d.deviceId} (${d.count})`
    });
  });

  const csv = [
    "Metric,Value",
    ...rows.map(r => `"${r.key}","${r.value}"`)
  ].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `recovery_analytics_${hours}h_${date}.csv`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
/**
 * 🆕 TASK-141.1
 * Get filtered recovery timeline
 */
export function getFilteredRecoveryTimeline({
  deviceId = null,
  types = [],
  sinceMs = null
} = {}) {
  let timeline = getRecoveryTimeline(deviceId);

  // 🔎 filter by event types
  if (Array.isArray(types) && types.length > 0) {
    timeline = timeline.filter(e => types.includes(e.type));
  }

  // ⏱ filter by time range
  if (typeof sinceMs === "number") {
    timeline = timeline.filter(e => e.ts >= sinceMs);
  }

  return timeline;
}
