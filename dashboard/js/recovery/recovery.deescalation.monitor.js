import { getSystemMode, setSystemMode, SYSTEM_MODE } from "./recovery.state.js";
import { getSystemHealthScore } from "../health/system.health.js";
import { isRecoveryInProgress } from "./recovery.state.js";

const CHECK_INTERVAL_MS = 30 * 1000; // 30s

// 🕒 track last SLA breach time
let lastSLABreachAt = 0;

// allow SLA monitor to update this
export function markSLABreachTime() {
  lastSLABreachAt = Date.now();
}

setInterval(() => {
  const mode = getSystemMode();
  const health = getSystemHealthScore();
  const recovering = isRecoveryInProgress();
  const now = Date.now();

  // 🔴 CRITICAL → DEGRADED
  if (
    mode === SYSTEM_MODE.CRITICAL &&
    health >= 60 &&
    !recovering
  ) {
    setSystemMode(
      SYSTEM_MODE.DEGRADED,
      "AUTO_DEESCALATE_CRITICAL"
    );
    return;
  }

  // 🟡 DEGRADED → STABLE
  if (
    mode === SYSTEM_MODE.DEGRADED &&
    health >= 80 &&
    !recovering &&
    now - lastSLABreachAt > 5 * 60 * 1000
  ) {
    setSystemMode(
      SYSTEM_MODE.STABLE,
      "AUTO_DEESCALATE_STABLE"
    );
  }

}, CHECK_INTERVAL_MS);
