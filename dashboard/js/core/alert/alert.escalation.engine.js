// core/alert/alert.escalation.engine.js

import { recordAlert,getEscalationState } from "./alert.escalation.store.js";
import { ALERT_SEVERITY } from "./alert.types.js";

/*
Policies (tunable later):
- FAST_COUNT: 3 alerts within 2 minutes → CRITICAL
- SLOW_PERSIST: persists 10 minutes → CRITICAL
*/

const FAST_COUNT_THRESHOLD = 3;
const FAST_COUNT_WINDOW_MS = 2 * 60 * 1000;

const SLOW_PERSIST_MS = 10 * 60 * 1000;

export function evaluateEscalation(alert, context = {}) {
  const state = recordAlert(alert, context);
  if (!state) return null;

  const now = Date.now();

  // ---- Policy 1: Fast burst ----
  const fastBurst =
    state.count >= FAST_COUNT_THRESHOLD &&
    now - state.firstSeenAt <= FAST_COUNT_WINDOW_MS;

  if (fastBurst) {
    return {
      escalateTo: ALERT_SEVERITY.CRITICAL,
      policy: "FAST_COUNT",
      reason: `Alert repeated ${state.count} times within ${
        FAST_COUNT_WINDOW_MS / 60000
      } minutes`
    };
  }

  // ---- Policy 2: Slow persistence ----
  const slowPersist =
    now - state.firstSeenAt >= SLOW_PERSIST_MS;

  if (slowPersist) {
    return {
      escalateTo: ALERT_SEVERITY.CRITICAL,
      policy: "SLOW_PERSIST",
      reason: `Alert persisted for ${
        SLOW_PERSIST_MS / 60000
      } minutes`
    };
  }

  return null;
}

// alert.escalation.engine.js

export function computeEscalatedSeverity(groupedAlert) {
  const { severity, count } = groupedAlert;

  // 🔺 escalation rules
  if (severity === "info" && count >= 3) {
    return "warning";
  }

  if (severity === "warning" && count >= 3) {
    return "critical";
  }

  return severity; // no downgrade
}
