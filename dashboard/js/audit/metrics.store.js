import { notifyUI } from "../store/store.notifier.js";
import { save, load } from "../utils/persist.js";
import { auditStore } from "./audit.store.js";

const lastIncrementAt = new Map();
const METRIC_DEDUP_WINDOW_MS = 500; // 0.5s

let metrics = load("metrics.data", {
  sent: 0,
  success: 0,
  failed: 0,
  timeout: 0,

  // 🔒 TASK-68: recovery metrics
  auto_quarantine: 0,
  auto_release: 0,
  failure_decay: 0,
  health_throttle: 0,
  recovery_sla_warning: 0,
  recovery_sla_critical: 0,
  recovery_sla_ok: 0,
});


export const metricsStore = {
  inc(key) {
    if (metrics[key] !== undefined) {
const now = Date.now();
const last = lastIncrementAt.get(key) || 0;

if (now - last < METRIC_DEDUP_WINDOW_MS) {
  return; // 🔒 Phase-12.3-A skip duplicate
}

lastIncrementAt.set(key, now);

  metrics = {
    ...metrics,
    [key]: metrics[key] + 1,
  };
  notifyUI();
}
save("metrics.data", metrics);

  },

  get() {
    // 🔒 TASK-96 STEP-4: safety defaults
    metrics.recovery_sla_ok ??= 0;
    metrics.recovery_sla_warning ??= 0;
    metrics.recovery_sla_critical ??= 0;
    return { ...metrics };
  }
};

export function getRecoverySuccessRateLast24h() {
  const logs = auditStore.getAll?.() || [];

  const since = Date.now() - 24 * 60 * 60 * 1000;

  let start = 0;
  let success = 0;

  for (const log of logs) {
    const t = log.at ? new Date(log.at).getTime() : 0;
    if (!t || t < since) continue;

    if (log.stage === "RECOVERY_START") start++;
    if (log.stage === "RECOVERY_SUCCESS") success++;
  }

  if (start === 0) {
    return { start: 0, success: 0, rate: 0 };
  }

  const rate = Math.round((success / start) * 100);

  return { start, success, rate };
}

// 🔒 TASK-91: recovery SLA metrics
export function incrementRecoverySLA(status) {
  if (status === "critical") {
    metrics.recovery_sla_critical++;
  } else if (status === "warning") {
    metrics.recovery_sla_warning++;
  } else if (status === "ok") {
    metrics.recovery_sla_ok++;
  }

save("metrics.data", metrics);
notifyUI();

}
