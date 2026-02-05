export function loadTopbar() {
  const topbar = document.getElementById("topbar");

  topbar.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
      <h3>🌾 Smart Farm Dashboard</h3>
      <div id="engine-heartbeat" style="display:flex;gap:6px;"></div>
    </div>
  `;
}
