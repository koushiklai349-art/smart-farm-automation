import { metricsStore } from "../audit/metrics.store.js";

export function RecoverySLACard() {
  const m = metricsStore.get();

  return `
    <div class="stat-card">
      <h4>⏱️ Recovery SLA</h4>
      <ul style="list-style:none;padding:0;margin:0;font-size:13px;">
        <li style="color:#22c55e;">
          ✅ SLA OK: <b>${m.recovery_sla_ok || 0}</b>
        </li>
        <li style="color:#facc15;">
          ⚠️ SLA Warning: <b>${m.recovery_sla_warning || 0}</b>
        </li>
        <li style="color:#ef4444;">
          🚨 SLA Critical: <b>${m.recovery_sla_critical || 0}</b>
        </li>
      </ul>
    </div>
  `;
}
