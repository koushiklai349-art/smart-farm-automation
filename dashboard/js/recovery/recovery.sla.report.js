import { metricsStore } from "../audit/metrics.store.js";
import { getDailyRecoverySummary } from "./recovery.timeline.store.js";

export function buildSLASummary(hours) {
  const m = metricsStore.get();
  const daily = getDailyRecoverySummary(hours);

  return {
    windowHours: hours,
    sla_ok: m.recovery_sla_ok || 0,
    sla_warning: m.recovery_sla_warning || 0,
    sla_critical: m.recovery_sla_critical || 0,
    attempts: daily.attempts,
    success: daily.success,
    successRate: daily.successRate,
    avgRecoveryMs: Math.round(daily.avgRecoveryMs || 0)
  };
}

export function exportSLASummaryCSV() {
  const last24h = buildSLASummary(24);
  const last7d = buildSLASummary(24 * 7);

  const rows = [
    ["Metric", "Last 24h", "Last 7d"],
    ["Attempts", last24h.attempts, last7d.attempts],
    ["Success", last24h.success, last7d.success],
    ["Success Rate (%)", last24h.successRate, last7d.successRate],
    ["Avg Recovery (ms)", last24h.avgRecoveryMs, last7d.avgRecoveryMs],
    ["SLA OK", last24h.sla_ok, last7d.sla_ok],
    ["SLA Warning", last24h.sla_warning, last7d.sla_warning],
    ["SLA Critical", last24h.sla_critical, last7d.sla_critical]
  ];

  const csv = rows.map(r => r.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `recovery_sla_report_${date}.csv`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
