import { OverviewPage } from "./pages/overview.page.js";
import { CowPage } from "./pages/cow.page.js";
import { GoatPage } from "./pages/goat.page.js";
import { PoultryPage } from "./pages/poultry.page.js";
import { FishPage } from "./pages/fish.page.js";
import { AlertsPage } from "./pages/alerts.page.js";
import { LogsPage } from "./pages/logs.page.js";
import { MetricsPage } from "./pages/metrics.page.js";
import { FailuresPage } from "./pages/failures.page.js";
import { SchedulePage } from "./pages/schedule.page.js";
import { CommandsPage } from "./pages/commands.page.js";
import { HistoryPage } from "./pages/history/history.page.js";
import { HealthPage } from "./pages/health/health.page.js";
import { AuditPage } from "./pages/audit.page.js";
import { RecoveryPage } from "./pages/recovery.page.js";
import { FarmsPage } from "./pages/farms.page.js";
import { DevicePage } from "./pages/device.page.js";


const routes = {
  farms: FarmsPage,
  device: DevicePage,
  overview: OverviewPage,
  cow: CowPage,
  goat: GoatPage,
  poultry: PoultryPage,
  fish: FishPage,
  alerts: AlertsPage,
  logs: LogsPage,
  metrics: MetricsPage,
  failures: FailuresPage,
  recovery: RecoveryPage,
  schedule: SchedulePage,
  commands: CommandsPage,
  audit: AuditPage,    
  history: HistoryPage,
  health: HealthPage
};

let currentPage = null;
let cleanupFn = null;

export function loadPage(pageName) {
  console.log("[ROUTER] loadPage called with:", pageName);

  if (!pageName || pageName === currentPage) return;

  // cleanup previous page (if any)
  if (typeof cleanupFn === "function") {
    cleanupFn();
    cleanupFn = null;
  }

  currentPage = pageName;

  const container = document.getElementById("page-container");
  if (!container) {
    console.error("❌ page-container missing");
  return;
  }

 let pageKey = pageName;
 let params = null;

// support dynamic routes like device/DEV-001
if (pageName.includes("/")) {
  const parts = pageName.split("/");
  pageKey = parts[0];
  params = { id: parts[1] };
}
console.log("[ROUTER] resolved pageKey:", pageKey, "params:", params);
const pageFn = routes[pageKey];
if (!pageFn) {
  container.innerHTML = `<p>Page not found</p>`;
  return;
}

const html = pageFn(params);
container.innerHTML = html || `
  <section class="page placeholder">
    <h1>${pageKey}</h1>
    <p>Page loaded, content coming soon…</p>
  </section>
`;

  // mount hook
 const hook =
  "on" +
  pageKey.charAt(0).toUpperCase() +
  pageKey.slice(1) +
  "Mounted";


  if (typeof window[hook] === "function") {
    const maybeCleanup = window[hook]();
    if (typeof maybeCleanup === "function") {
      cleanupFn = maybeCleanup;
    }
  }
}

export function getCurrentPage() {
  return currentPage;
}
