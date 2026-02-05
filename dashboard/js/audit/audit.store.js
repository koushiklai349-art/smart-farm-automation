import { RETENTION_DAYS, getRetentionCutoff } from "../system/retention.config.js";
import { notifyUI } from "../store/store.notifier.js";
import { save, load } from "../utils/persist.js";

const lastAuditAt = new Map();
const AUDIT_DEDUP_WINDOW_MS = 1000; // 1s

const logs = load("audit.logs", []);


export const auditStore = {
  
  log(entry) {
    pruneOldAudits();

    const now = Date.now();
    const key = `${entry.type}:${entry.refId || "global"}`;
    const last = lastAuditAt.get(key) || 0;

    if (now - last < AUDIT_DEDUP_WINDOW_MS) {
      return; // 🔒 Phase-12.3-B skip duplicate audit
    }

    lastAuditAt.set(key, now);

    save("audit.logs", logs);

    logs.unshift({
      ...entry,
      at: new Date().toISOString(),
    });
    notifyUI();
  },

  getAll() {
    return logs.slice(0, 500); // cap for safety
  }
};

function pruneOldAudits() {
  const cutoff = getRetentionCutoff(RETENTION_DAYS.AUDIT);

 let removed = 0;

  for (let i = logs.length - 1; i >= 0; i--) {
    const t = logs[i]?.at
      ? new Date(logs[i].at).getTime()
      : 0;

    if (t && t < cutoff) {
      logs.splice(i, 1);
      removed++;
    }
  }

  if (removed > 0) {
    save("audit.logs", logs);
  }
}
