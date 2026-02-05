import { generateIncidentPostMortem } from
  "../system/incident.postmortem.engine.js";

export function showPostMortem(sinceTs) {
  const report = generateIncidentPostMortem({
    sinceTs
  });

  const panel = document.createElement("div");
  panel.className = "postmortem-panel";

  panel.innerHTML = `
    <h3>📄 Incident Post-Mortem</h3>

    <pre>${JSON.stringify(report, null, 2)}</pre>

    <button id="pm-close">Close</button>
  `;

  panel.querySelector("#pm-close").onclick = () =>
    panel.remove();

  document.body.appendChild(panel);
}
