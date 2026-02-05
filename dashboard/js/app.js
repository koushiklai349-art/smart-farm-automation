import { bootstrapSystem } from "./system/system.bootstrap.js";
import { loadPage } from "./router.js";
import { loadSidebar, initSidebar } from "./components/sidebar.js";
import { loadTopbar } from "./components/topbar.js";
import { renderHeartbeatIndicator } from "./components/engine.heartbeat.indicator.js";
import "./ui/dashboard/alert.list.js";
import "./ui/dashboard/engine.restart.history.view.js";
import { store } from "./store.js";
import { initSystemStatusBar,updateSystemStatusFromStore} from "./components/system.status.bar.js";
import "./recovery/playbook/recovery.playbook.analytics.js";

window.addEventListener("DOMContentLoaded", async () => {
  // 1️⃣ UI shell first
  loadSidebar();
  initSidebar();
  loadTopbar();

  // 2️⃣ Page HTML
  loadPage("overview");

  // 3️⃣ System bootstrap AFTER UI is ready
  await bootstrapSystem();
  hideSkeleton();
// after DOM ready
initSystemStatusBar(document.body);
// 🔁 keep status bar in sync with store
updateSystemStatusFromStore(store);

// optional: re-render on store updates
if (store && typeof store.subscribe === "function") {
  store.subscribe(() => {
    updateSystemStatusFromStore(store);
  });
}


  // 4️⃣ Heartbeat UI attach (after engine exists)
  const el = document.getElementById("engine-heartbeat");
  if (el) {
    renderHeartbeatIndicator(el);
  } else {
    console.warn("engine-heartbeat container not found");
  }
  // hide skeleton after UI + system ready

});
function hideSkeleton() {
  const sk = document.getElementById("global-skeleton");
  if (sk) sk.classList.add("hidden");
}
