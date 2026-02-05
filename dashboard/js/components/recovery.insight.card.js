// dashboard/js/components/recovery.insight.card.js

export function createRecoveryInsightCard({
  title,
  value,
  subtitle = "",
  icon = "📊",
  color = "#1976d2",
  explain = null   // ✅ ADD THIS
}) {
  const card = document.createElement("div");
  card.className = "recovery-insight-card";
  card.style.borderLeft = `4px solid ${color}`;

  card.innerHTML = `
    <div class="insight-icon">${icon}</div>
    <div class="insight-body">
      <div class="insight-title">${title}</div>
      <div class="insight-value">${value}</div>
      ${
        subtitle
          ? `<div class="insight-subtitle">${subtitle}</div>`
          : ""
      }
    </div>
${explain ? `
  <div class="playbook-explain">
    <div class="explain-title">
      🧠 Why this action was taken
    </div>

    <ul class="explain-list">
      <li><b>Triggered Rule:</b> ${explain.ruleId}</li>
      <li><b>Risk Level:</b> ${explain.risk}</li>

      ${explain.snapshot ? `
        <li><b>Incident Status:</b> ${explain.snapshot.status}</li>
        <li><b>Retry Count:</b> ${explain.snapshot.retryCount}</li>
        ${
          explain.snapshot.durationMs != null
            ? `<li><b>Duration:</b> ${
                Math.round(explain.snapshot.durationMs / 1000)
              } seconds</li>`
            : ""
        }
      ` : ""}
    </ul>
  </div>
` : ""}


  `;

  return card;
}
