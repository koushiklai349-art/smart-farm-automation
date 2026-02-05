import { calculateOperatorTrustScore } from "../system/operator.trust.engine.js";

function getTrustColor(score) {
  if (score >= 80) return "#2e7d32"; // green
  if (score >= 60) return "#f9a825"; // yellow
  if (score >= 40) return "#ef6c00"; // orange
  return "#c62828"; // red
}

function getTrustLabel(score) {
  if (score >= 80) return "Reliable";
  if (score >= 60) return "Generally Reliable";
  if (score >= 40) return "Risky";
  return "Unreliable";
}

export function OperatorTrustCard() {
  const { score, breakdown } = calculateOperatorTrustScore();
  const color = getTrustColor(score);
  const label = getTrustLabel(score);

  const recent = breakdown.slice(0, 3);

  return `
    <div class="operator-trust-card" style="border-left:4px solid ${color}">
      <div class="trust-title">👤 Operator Trust</div>

      <div class="trust-score" style="color:${color}">
        ${score}/100 <span class="trust-label">${label}</span>
      </div>

      <div class="trust-breakdown">
        <b>Last overrides:</b>
        <ul>
          ${
            recent.length
              ? recent
                  .map(
                    b =>
                      `<li>
                        ${
                          b.delta > 0 ? "➕" : "➖"
                        } ${b.delta}
                        (Failure rate ${b.failureRate}%)
                      </li>`
                  )
                  .join("")
              : "<li>No recent overrides</li>"
          }
        </ul>
      </div>
    </div>
  `;
}
