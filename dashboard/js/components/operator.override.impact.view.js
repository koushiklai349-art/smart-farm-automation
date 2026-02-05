import { analyzeOverrideImpact } from "../system/operator.override.impact.js";

export function showOverrideImpact(overrideEvent) {
  if (!overrideEvent?.meta) return;

  const start =
    overrideEvent.meta.startedAt ||
    overrideEvent.meta.time;
  const end =
    overrideEvent.meta.endedAt ||
    Date.now();

  const impact = analyzeOverrideImpact(start, end);

  const panel = document.createElement("div");
  panel.className = "override-impact-panel";

  panel.innerHTML = `
    <div class="impact-header">
      <h3>🧑‍💼 Override Impact Summary</h3>
      <button class="close-btn">✖</button>
    </div>

    <div class="impact-body">
      <p><b>Total auto-actions:</b> ${impact.totalActions}</p>
      <p><b>Success:</b> ${impact.successCount}</p>
      <p><b>Failed:</b> ${impact.failureCount}</p>
      <p><b>Failure rate:</b> ${impact.failureRate}%</p>

      <p><b>Devices affected:</b></p>
      <ul>
        ${
          impact.devicesTouched.length
            ? impact.devicesTouched
                .map(d => `<li>${d}</li>`)
                .join("")
            : "<li>None</li>"
        }
      </ul>
    </div>
  `;

  panel.querySelector(".close-btn").onclick = () =>
    panel.remove();

  document.body.appendChild(panel);
}
