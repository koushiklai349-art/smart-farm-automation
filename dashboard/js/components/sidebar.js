import { loadPage } from "../router.js";

let sidebarBound = false;

export function loadSidebar() {
  const sidebar = document.getElementById("sidebar");

  sidebar.innerHTML = `
    <h3>🌾 Smart Farm</h3>
    <ul>
      <li data-page="overview"tabindex="0">🏠 Overview</li>
      <li data-page="cow"tabindex="0">🐄 Cow</li>
      <li data-page="goat"tabindex="0">🐐 Goat</li>
      <li data-page="poultry"tabindex="0">🐔 Poultry</li>
      <li data-page="fish"tabindex="0">🐟 Fish</li>
      <li data-page="alerts"tabindex="0">🚨 Alerts</li>
      <li data-page="metrics"tabindex="0">📊 Metrics</li>
      <li data-page="logs"tabindex="0">📜 Logs</li>
      <li data-page="failures"tabindex="0">🛑 Failures</li>
      <li data-page="recovery" tabindex="0">🛠️ Recovery</li>
      <li data-page="schedule"tabindex="0">⏰ Schedule</li>
      <li data-page="commands"tabindex="0">🎮 Commands</li>
      <li data-page="audit"tabindex="0">📜 Audit Logs</li>
      <li data-page="history"tabindex="0">📜 History</li>
      <li data-page="health"tabindex="0">🩺 System Health</li>
    </ul>
  `;
}

export function initSidebar() {
  if (sidebarBound) return;
  sidebarBound = true;

  document
    .getElementById("sidebar")
    .addEventListener("click", onSidebarClick);
    setActiveItem("overview");

}

function onSidebarClick(e) {
  const item = e.target.closest("li[data-page]");
  if (!item) return;

  const page = item.dataset.page;
  loadPage(page);
  setActiveItem(page);
}

function setActiveItem(page) {
  const items = document.querySelectorAll("#sidebar li[data-page]");
  items.forEach(li => {
    if (li.dataset.page === page) {
      li.classList.add("active");
    } else {
      li.classList.remove("active");
    }
  });
}
let sidebarKeyBound = false;
if (!sidebarKeyBound) {
document.getElementById("sidebar").addEventListener("keydown", (e) => {
  const item = e.target.closest("li[data-page]");
  if (!item) return;
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    const page = item.dataset.page;
    loadPage(page);
    setActiveItem(page);
  }
});
 sidebarKeyBound = true;
}