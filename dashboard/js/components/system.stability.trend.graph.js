import { getStabilityTrend } from "../system/system.stability.trend.store.js";

const WIDTH = 260;
const HEIGHT = 80;
const PADDING = 8;

function getY(score) {
  // score: 0–100 → SVG Y
  const usableHeight = HEIGHT - PADDING * 2;
  return HEIGHT - PADDING - (score / 100) * usableHeight;
}

export function SystemStabilityTrendGraph() {
  const data = getStabilityTrend();
  if (!data.length) return "";

  const minTs = data[0].ts;
  const maxTs = data[data.length - 1].ts || minTs + 1;

  const usableWidth = WIDTH - PADDING * 2;

  const points = data.map((d, i) => {
    const x =
      PADDING +
      ((d.ts - minTs) / (maxTs - minTs || 1)) * usableWidth;
    const y = getY(d.score);
    return `${x},${y}`;
  });

  // color based on last score
  const lastScore = data[data.length - 1].score;
  let stroke = "#2e7d32"; // green
  if (lastScore < 40) stroke = "#c62828";
  else if (lastScore < 70) stroke = "#ef6c00";
  else if (lastScore < 80) stroke = "#f9a825";

  return `
    <div class="stability-trend">
      <div class="trend-title">📈 Stability Trend</div>
      <svg width="${WIDTH}" height="${HEIGHT}">
        <polyline
          fill="none"
          stroke="${stroke}"
          stroke-width="2"
          points="${points.join(" ")}"
        />
      </svg>
    </div>
  `;
}
