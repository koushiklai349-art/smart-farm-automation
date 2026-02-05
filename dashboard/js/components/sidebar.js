import { loadPage } from "../router.js";
import { getActiveFarm } from "../farm/farm.info.js";
import { store } from "../store.js";
import { farmContext } from "../farm/farm.context.store.js";

let sidebarBound = false;
let sidebarKeyBound = false;
let sidebarRaf = null;

function safeReloadSidebar() {
  if (sidebarRaf) return;
  sidebarRaf = requestAnimationFrame(() => {
    sidebarRaf = null;
    loadSidebar();
  });
}

function getAlertCount() {
  return Array.isArray(store.alerts) ? store.alerts.length : 0;
}

export function loadSidebar() {
  const sidebar = document.getElementById("sidebar");
  const farm = getActiveFarm();
  const alertCount = getAlertCount();

  const farmBadge = farm
    ? `<div class="farm-badge">📍 ${farm.name}</div>`
    : `<div class="farm-badge">📍 No Farm Selected</div>`;

  sidebar.innerHTML = `
    ${farmBadge}
    <h3>🌾 Smart Farm</h3>
    <ul>
      <li data-page="overview" tabindex="0">🏠 Overview</li>
      <li data-page="cow" tabindex="0">🐄 Cow</li>
      <li data-page="goat" tabindex="0">🐐 Goat</li>
      <li data-page="poultry" tabindex="0">🐔 Poultry</li>
      <li data-page="fish" tabindex="0">🐟 Fish</li>

      <li data-page="alerts" tabindex="0">
        🚨 Alerts ${alertCount > 0 ? `<span class="alert-badge">${alertCount}</span>` : ""}
      </li>

      <li data-page="metrics" tabindex="0">📊 Metrics</li>
      <li data-page="logs" tabindex="0">📜 Logs</li>
      <li data-page="failures" tabindex="0">🛑 Failures</li>
      <li data-page="recovery" tabindex="0">🛠️ Recovery</li>
      <li data-page="schedule" tabindex="0">⏰ Schedule</li>
      <li data-page="commands" tabindex="0">🎮 Commands</li>
      <li data-page="audit" tabindex="0">📜 Audit Logs</li>
      <li data-page="history" tabindex="0">📜 History</li>
      <li data-page="health" tabindex="0">🩺 System Health</li>
    </ul>
  `;
}

export function initSidebar() {
  if (sidebarBound) return;
  sidebarBound = true;

  const el = document.getElementById("sidebar");
  el.addEventListener("click", onSidebarClick);

  if (!sidebarKeyBound) {
    el.addEventListener("keydown", onSidebarKey);
    sidebarKeyBound = true;
  }

  setActiveItem("overview");

  // 🔁 refresh sidebar on farm change
window.addEventListener("farm:changed", () => {
  safeReloadSidebar();
  setActiveItem("overview");
});

if (store.subscribe) {
  store.subscribe(safeReloadSidebar);
}

}


function onSidebarClick(e) {
  const item = e.target.closest("li[data-page]");
  if (!item) return;

  if (!farmContext.hasFarm() && item.dataset.page !== "farms") {
    loadPage("farms");
    return;
  }

  const page = item.dataset.page;
  loadPage(page);
  setActiveItem(page);
}

function onSidebarKey(e) {
  const item = e.target.closest("li[data-page]");
  if (!item) return;

  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    const page = item.dataset.page;
    loadPage(page);
    setActiveItem(page);
  }
}

function setActiveItem(page) {
  const items = document.querySelectorAll("#sidebar li[data-page]");
  items.forEach(li => {
    li.classList.toggle("active", li.dataset.page === page);
  });
}
