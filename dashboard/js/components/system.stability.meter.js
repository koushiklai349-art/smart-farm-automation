import { calculateSystemStabilityScore } from "../system/system.stability.engine.js";

function getColor(score) {
  if (score >= 90) return "#2e7d32"; // green
  if (score >= 70) return "#f9a825"; // yellow
  if (score >= 40) return "#ef6c00"; // orange
  return "#c62828"; // red
}

export function SystemStabilityMeter() {
  const { score, breakdown } = calculateSystemStabilityScore();
  const color = getColor(score);

  const tooltip = breakdown
    .map(b =>
      b.penalty != null
        ? `${b.factor}: -${b.penalty}`
        : `${b.factor}: ${b.value}`
    )
    .join(" | ");

  return `
    <div class="system-stability" title="${tooltip}">
      <div class="stability-label">
        🧭 Stability
      </div>
      <div class="stability-bar">
        <div
          class="stability-fill"
          style="width:${score}%; background:${color}"
        ></div>
      </div>
      <div class="stability-score">
        ${score}/100
      </div>
    </div>
  `;
}
