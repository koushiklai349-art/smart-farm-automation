import { store } from "../store.js";
import {
  metricsStore,
  getRecoverySuccessRateLast24h
} from "../audit/metrics.store.js";
import { getSensorSnapshot } from "../store/sensor.store.js";

let unsubscribe = null;

function card(label, value, unit = "", hint = "", extraClass = "") {
  return `
    <div class="metric-card ${extraClass}">
      <div class="metric-label">${label}</div>
      <div class="metric-value">
        ${value ?? "—"} ${value != null ? unit : ""}
      </div>
      ${hint ? `<div class="metric-hint">${hint}</div>` : ""}
    </div>
  `;
}

function healthBadge(state) {
  const cls =
    state === "critical"
      ? "health-critical"
      : state === "warning"
      ? "health-warning"
      : "health-good";

  return `<span class="health-badge ${cls}">${state}</span>`;
}

export function MetricsPage() {
  const system = store.system || {};
  const sensors = getSensorSnapshot();
  const metrics = metricsStore.get();
  const recovery = getRecoverySuccessRateLast24h();

  return `
    <section class="page metrics-page">
      <h1>📊 Metrics</h1>

      <!-- System Health -->
      <h2>System Health</h2>
      <div class="metrics-grid">
        ${card(
          "Health",
          healthBadge(system.health),
          "",
          `Score: ${system.healthScore ?? "—"}`,
          "health-card"
        )}
        ${card("Power", system.power)}
        ${card("Network", system.network)}
        ${card("Last Update", system.lastUpdate)}
      </div>

      <!-- Sensors -->
      <h2>Sensor Snapshot</h2>
      <div class="metrics-grid">
        ${card("Temperature", sensors.temperature, "°C")}
        ${card("Humidity", sensors.humidity, "%")}
        ${card("Water Level", sensors.waterLevel, "%")}
      </div>

      <!-- Commands -->
      <h2>Command Metrics</h2>
      <div class="metrics-grid">
        ${card("Sent", metrics.sent)}
        ${card("Success", metrics.success)}
        ${card("Failed", metrics.failed)}
        ${card("Timeout", metrics.timeout)}
      </div>

      <!-- Recovery -->
      <h2>Recovery Metrics</h2>
      <div class="metrics-grid">
        ${card("Auto Quarantine", metrics.auto_quarantine)}
        ${card("Auto Release", metrics.auto_release)}
        ${card(
          "Recovery Success (24h)",
          `${recovery.rate}%`,
          "",
          `${recovery.success}/${recovery.start}`
        )}
        ${card("SLA OK", metrics.recovery_sla_ok)}
        ${card("SLA Warning", metrics.recovery_sla_warning)}
        ${card("SLA Critical", metrics.recovery_sla_critical)}
      </div>
    </section>
  `;
}

/**
 * 🔁 Live update hook
 */
export function onMetricsMounted() {
  if (unsubscribe) return;

  if (store.subscribe) {
    unsubscribe = store.subscribe(() => {
      const container =
        document.getElementById("page-container");
      if (!container) return;
      container.innerHTML = MetricsPage();
    });
  }

  return () => {
    if (typeof unsubscribe === "function") {
      unsubscribe();
      unsubscribe = null;
    }
  };
}

window.onMetricsMounted = onMetricsMounted;
