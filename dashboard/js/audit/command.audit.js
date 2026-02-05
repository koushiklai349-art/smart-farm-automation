// audit/command.audit.js
import { addAuditEntry } from "./audit.history.js";

export function auditCommand(cmd, status, meta = {}) {
  if (!cmd || !status) {
    console.warn("[CMD_AUDIT] Invalid audit call", { cmd, status });
    return;
  }

  const commandId = cmd.commandId || cmd.id;

  const correlationId =
    meta.alertId ||
    cmd.alertId ||
    cmd.correlationId ||
    null;
    
  const entry = {
    commandId,
    deviceId: cmd.deviceId,
    action: cmd.action,
    status,
    source: cmd.source,
    retryCount: cmd.retryCount || 0,
    time: Date.now(),
    meta: {
      ...meta,
      correlationId,

      // 🚨 TASK-106: blocked command explainability
      ...(status === "blocked"
        ? {
            blockedReason: cmd.blockedReason || meta.blockedReason,
            blockedMeta: cmd.blockedMeta || meta.blockedMeta || null
          }
        : {})
    }
  };

  // 🔍 Debug visibility
  console.debug("[CMD_AUDIT]", {
    ...entry,
    timeISO: new Date(entry.time).toISOString()
  });

  addAuditEntry(entry);
}
