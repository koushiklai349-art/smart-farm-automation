// dashboard/js/components/recovery.insight.panel.js

import { correlateRecoveryIncidents } from "../recovery/recovery.timeline.correlation.js";
import { buildRecoveryInsights } from "../recovery/recovery.insights.engine.js";
import { createRecoveryInsightCard } from "./recovery.insight.card.js";

export function renderRecoveryInsightsPanel(container, timeline) {
  if (!container) return;

  container.innerHTML = "";

  const incidents = correlateRecoveryIncidents(timeline);
  const insights = buildRecoveryInsights(incidents);

  const panel = document.createElement("div");
  panel.className = "recovery-insight-panel";

  panel.appendChild(
    createRecoveryInsightCard({
      title: "Total Incidents",
      value: insights.total,
      icon: "🧩"
    })
  );

  panel.appendChild(
    createRecoveryInsightCard({
      title: "Open Incidents",
      value: insights.open,
      subtitle: `${insights.closed} closed`,
      icon: "⏳",
      color: "#f57c00"
    })
  );

  panel.appendChild(
    createRecoveryInsightCard({
      title: "Avg Recovery Time",
      value: insights.avgRecoveryMs
        ? `${Math.round(insights.avgRecoveryMs / 1000)}s`
        : "—",
      icon: "⏱️",
      color: "#388e3c"
    })
  );

  panel.appendChild(
    createRecoveryInsightCard({
      title: "Avg Retries",
      value: insights.avgRetries,
      icon: "🔁",
      color: "#5e35b1"
    })
  );

  panel.appendChild(
    createRecoveryInsightCard({
      title: "SLA Breach Rate",
      value: `${insights.slaBreachRate}%`,
      icon: "🚨",
      color:
        insights.slaBreachRate > 20
          ? "#d32f2f"
          : insights.slaBreachRate > 5
          ? "#f9a825"
          : "#388e3c"
    })
  );

  container.appendChild(panel);
}
