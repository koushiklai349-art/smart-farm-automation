import {
  getSystemHealthScore,
  getHealthTrendSlope,
  __debugDropHealth,
  __debugBoostHealth
} from "../health/system.health.js";
import { DEBUG_MODE } from "../utils/logger.js";

export function renderHealthDebugPanel(container) {
  if (!DEBUG_MODE || !container) return;

  const score = getSystemHealthScore();
  const slope = getHealthTrendSlope();

  container.innerHTML = `
    <div style="
      border:1px dashed #888;
      padding:8px;
      margin-top:10px;
      font-size:12px;
      background:#111;
      color:#0f0;
    ">
      <strong>🧪 Health Debug</strong><br/>
      Score: <b>${score}</b><br/>
      Trend slope: <b>${slope.toFixed(4)}</b><br/>

      <div style="margin-top:6px;">
        <button id="dbg-drop">⬇ Drop -10</button>
        <button id="dbg-boost">⬆ Boost +10</button>
      </div>
    </div>
  `;

  const dropBtn = container.querySelector("#dbg-drop");
  const boostBtn = container.querySelector("#dbg-boost");

  if (dropBtn) {
    dropBtn.onclick = () => {
      __debugDropHealth(10);
    };
  }

  if (boostBtn) {
    boostBtn.onclick = () => {
      __debugBoostHealth(10);
    };
  }
}
