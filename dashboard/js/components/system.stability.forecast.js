import { predictStability } from "../system/system.stability.predictor.js";

function getColor(risk) {
  if (risk === "high") return "#c62828";
  if (risk === "medium") return "#ef6c00";
  return "#2e7d32";
}

export function SystemStabilityForecast() {
  const forecast = predictStability();
  if (!forecast) return "";

  const color = getColor(forecast.risk);

  return `
    <div class="stability-forecast" style="border-left:4px solid ${color}">
      <div class="forecast-title">🔮 Stability Forecast (10 min)</div>
      <div class="forecast-label" style="color:${color}">
        ${forecast.label}
      </div>
      <div class="forecast-meta">
        Current: <b>${forecast.current}</b>
        →
        Predicted: <b>${forecast.predicted}</b>
        <span class="forecast-slope">(Δ ${forecast.slope}/min)</span>
      </div>
    </div>
  `;
}
