import { metricsStore } from "../audit/metrics.store.js";
import { getRecoveryDurations } from "../recovery/recovery.timeline.store.js";
import { getRecoverySuccessRateLast24h } from "../audit/metrics.store.js";
import { getDailyRecoverySummary } from "../recovery/recovery.timeline.store.js";
import { exportRecoveryAnalyticsCSV } from "../recovery/recovery.timeline.store.js";
import { exportSLASummaryCSV } from "../recovery/recovery.sla.report.js";

export function RecoveryStatsCard() {
  const m = metricsStore.get();
  const durations = getRecoveryDurations();
  const recovery24h = getRecoverySuccessRateLast24h();
  const daily = getDailyRecoverySummary(24);
  const lastDurations = durations
  .slice(-10)
  .map(d => d.durationMs);

let avg = "";
let min = "";
let max = "";
let total = durations.length;

if (total > 0) {
  const values = durations.map(d => d.durationMs);
  const sum = values.reduce((a, b) => a + b, 0);

  avg = Math.round(sum / total);
  min = Math.min(...values);
  max = Math.max(...values);
}

function fmt(ms) {
  if (!ms) return "-";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}
function getTrend(values) {
  if (!values || values.length < 2) return "➖ Stable";

  const first = values[0];
  const last = values[values.length - 1];

  if (last > first * 1.2) return "⬆️ Slower";
  if (last < first * 0.8) return "⬇️ Faster";
  return "➖ Stable";
}

const trend = getTrend(lastDurations);

function getTrendColor(trend) {
  if (trend.includes("⬇️")) return "#22c55e"; // green
  if (trend.includes("⬆️")) return "#ef4444"; // red
  return "#64748b"; // grey
}

const trendColor = getTrendColor(trend);

  return `
    <div class="stat-card">
      <h4>🛡️ Recovery</h4>
      <ul style="list-style:none;padding:0;margin:0;font-size:13px;">
        <li>🔒 Auto Quarantine: <b>${m.auto_quarantine || 0}</b></li>
        <li>🔓 Auto Release: <b>${m.auto_release || 0}</b></li>
        <li>🚦 Health Throttle: <b>${m.health_throttle || 0}</b></li>
        <li>🔁 Failure Decay: <b>${m.failure_decay || 0}</b></li>
        <li>⏱ Avg Recovery: <b>${fmt(avg)}</b></li>
        <li>⚡ Fastest: <b>${fmt(min)}</b></li>
        <li>🐢 Slowest: <b>${fmt(max)}</b></li>
        <li>📈 Total Recoveries: <b>${total}</b></li>
        <li>⏱ 24h Attempts: <b>${recovery24h.start}</b></li>
        <li>✅ 24h Success: <b>${recovery24h.success}</b></li>
        <li>📊 Success Rate: <b>${recovery24h.rate}%</b></li>
        <li>
         📉 Recovery Trend:
        <b style="color:${trendColor}">${trend}</b>
        </li>
        <li style="margin-top:6px;">
        <button
        style="padding:4px 8px;font-size:11px;cursor:pointer;"
        onclick="window.exportRecoveryAnalytics()">
        ⬇ Export Recovery Analytics
        </button>
        </li>
        <li style="margin-top:6px;">
        <button
        style="padding:4px 8px;font-size:11px;cursor:pointer;"
        onclick="window.exportSLASummary()">
        ⬇ Export SLA Report
        </button>
        </li>

        </ul>

      <li style="margin-top:6px;"><b>📅 Daily Summary (24h)</b></li>
      <li>🧮 Attempts: <b>${daily.attempts}</b></li>
      <li>✅ Success: <b>${daily.success}</b></li> 
      <li>📊 Rate: <b>${daily.successRate}%</b></li>
      <li>⏱ Avg Time: <b>${fmt(daily.avgRecoveryMs)}</b></li>
      ${
       daily.topFailingDevices.length
        ? `<li>🔥 Top Failing:
        ${daily.topFailingDevices
          .map(d => `${d.deviceId} (${d.count})`)
          .join(", ")}
       </li>`
       : ""
}

    </div>
  `;
}
window.exportRecoveryAnalytics = function () {
  exportRecoveryAnalyticsCSV(24);
};

window.exportSLASummary = function () {
  exportSLASummaryCSV();
};
