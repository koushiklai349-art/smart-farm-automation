import { getStabilityTrend } from "../../system/system.stability.trend.store.js";

let chart = null;

export function renderAlertTrendGraph() {
  const canvas = document.getElementById("alert-trend-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const trend = getStabilityTrend();

  const labels = trend.map(t =>
    new Date(t.ts).toLocaleTimeString()
  );

  const stability = trend.map(t => t.score);
  const warnings = trend.map(t => t.alerts?.warning || 0);
  const criticals = trend.map(t => t.alerts?.critical || 0);

  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = stability;
    chart.data.datasets[1].data = warnings;
    chart.data.datasets[2].data = criticals;
    chart.update();
    return;
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Stability Score",
          data: stability,
          borderColor: "#4caf50",
          yAxisID: "y",
          tension: 0.3
        },
        {
          label: "Warning Alerts",
          data: warnings,
          borderColor: "#ff9800",
          yAxisID: "y1",
          tension: 0.3
        },
        {
          label: "Critical Alerts",
          data: criticals,
          borderColor: "#f44336",
          yAxisID: "y1",
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      stacked: false,
      scales: {
        y: {
          type: "linear",
          position: "left",
          min: 0,
          max: 100
        },
        y1: {
          type: "linear",
          position: "right",
          min: 0,
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}
