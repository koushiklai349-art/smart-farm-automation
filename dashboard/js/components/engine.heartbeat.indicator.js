// js/components/engine.heartbeat.indicator.js

import { getAllHeartbeatStatus } from "../system/engine.heartbeat.js";

let container;
let timer = null;

/**
 * Render heartbeat status dots
 */
export function renderHeartbeatIndicator(targetEl) {
  container = targetEl;
  update();

  // 🔒 guard against multiple intervals
  if (timer) return;
  timer = setInterval(update, 2000);
}

function update() {
  if (!container) return;

  const statuses = getAllHeartbeatStatus();

  container.innerHTML = "";

  statuses.forEach(([name, hb]) => {
    const dot = document.createElement("span");
    dot.title = `${name}: ${hb.status}`;

    dot.style.display = "inline-block";
    dot.style.width = "10px";
    dot.style.height = "10px";
    dot.style.marginRight = "6px";
    dot.style.borderRadius = "50%";
    dot.style.background =
      hb.status === "alive" ? "#2ecc71" : "#e74c3c";

    container.appendChild(dot);
  });
}
