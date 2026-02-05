import { getRecoveryDurations } from "./recovery.timeline.store.js";
import { raiseAlert } from "../core/alert/alert.manager.js";
let lastPredictiveAlertAt = 0;
const PREDICTIVE_COOLDOWN_MS = 60 * 1000; // 1 min

// 🔒 threshold (ms)
const SLOW_RECOVERY_THRESHOLD_MS = 5 * 60 * 1000; // 5 min
const WINDOW = 5; // last 5 recoveries

export function checkPredictiveRecoveryRisk() {
  const durations = getRecoveryDurations()
    .slice(-WINDOW)
    .map(d => d.durationMs);

  if (durations.length < WINDOW) return;

  const avg =
    durations.reduce((a, b) => a + b, 0) / durations.length;
     const now = Date.now();

  if (avg >= SLOW_RECOVERY_THRESHOLD_MS) {
    if (now - lastPredictiveAlertAt < PREDICTIVE_COOLDOWN_MS) return;

    lastPredictiveAlertAt = now;
    raiseAlert(
      {
        code: "RECOVERY_DEGRADING",
        severity: "warning",
        message: "Recovery time is degrading (predictive)"
      },
      {
        avgRecoveryMs: Math.round(avg),
        window: WINDOW
      }
    );
  }
}
