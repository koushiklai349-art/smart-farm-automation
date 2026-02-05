import { simulateSystemDecision } from "../system/simulation.engine.js";

export function SimulationPanel() {
  return `
    <div class="simulation-panel">
      <h3>🧪 Simulation / What-If</h3>

      <label>
        Mock Risk
        <select id="sim-risk">
          <option value="">Auto</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>

      <label>
        <input type="checkbox" id="sim-override" />
        Assume Operator Override Active
      </label>

      <button onclick="window.runSimulation()">
        Run Simulation
      </button>

      <pre id="sim-result"></pre>
    </div>
  `;
}

window.runSimulation = () => {
  const risk =
    document.getElementById("sim-risk").value || null;

  const overrideActive =
    document.getElementById("sim-override").checked;

  const result = simulateSystemDecision({
    mockRisk: risk,
    overrideActive
  });

  document.getElementById("sim-result").textContent =
    JSON.stringify(result, null, 2);
};
