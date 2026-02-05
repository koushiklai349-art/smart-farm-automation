// js/ui/dashboard/engine.restart.history.view.js
import { getRestartHistory }  
from "../../system/engine.restart.history.js";



export function renderRestartHistory() {
  const container = document.getElementById("engine-restart-history");
  if (!container) return;

  const history = getRestartHistory();

  if (!history.length) {
    container.innerHTML = `<div class="no-data">No restart history</div>`;
    return;
  }

  container.innerHTML = `
    <table class="restart-table">
      <thead>
        <tr>
          <th>Engine</th>
          <th>Status</th>
          <th>Attempt</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        ${history.map(h => `
          <tr class="${h.status}">
            <td>${h.engine}</td>
            <td>${h.status}</td>
            <td>${h.attempt}</td>
            <td>${new Date(h.timestamp).toLocaleTimeString()}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}
window.addEventListener("ENGINE_RESTART_UPDATED", () => {
  renderRestartHistory();
});
