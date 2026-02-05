// dashboard/js/pages/recovery.page.js

import {
  getFilteredRecoveryTimeline
} from "../recovery/recovery.timeline.store.js";

import {
  renderRecoveryTimeline
} from "../recovery/recovery.timeline.view.js";

import {
  renderRecoveryInsightsPanel
} from "../components/recovery.insight.panel.js";

export function RecoveryPage() {
  return `
    <section class="page recovery-page">
      <h1>🛠️ Recovery</h1>

      <!-- 🔹 Recovery Insights -->
      <div id="recovery-insights"></div>

      <!-- 🔹 Recovery Timeline -->
      <div id="recovery-timeline"></div>
    </section>
  `;
}

/**
 * Router mount hook
 */
export function onRecoveryMounted() {
  // 1️⃣ Build timeline once (single source)
  const timeline = getFilteredRecoveryTimeline();

  // 2️⃣ Render insights
  const insightsBox =
    document.getElementById("recovery-insights");

  if (insightsBox) {
    renderRecoveryInsightsPanel(insightsBox, timeline);
  }

  // 3️⃣ Render timeline UI (handles its own filters)
  const timelineBox =
    document.getElementById("recovery-timeline");

  if (timelineBox) {
    renderRecoveryTimeline(timelineBox);
  }
}

// expose to router
window.onRecoveryMounted = onRecoveryMounted;
