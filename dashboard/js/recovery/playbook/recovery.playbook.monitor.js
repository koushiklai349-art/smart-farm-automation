import { computePlaybookEffectiveness }
  from "./recovery.playbook.effectiveness.js";
import { auditStore } from "../../audit/audit.store.js";

const MIN_SUCCESS_RATE = 40;

export function monitorPlaybookEffectiveness() {
  const stats = computePlaybookEffectiveness({
    sinceMs: Date.now() - 24 * 60 * 60 * 1000
  });

  for (const [action, s] of Object.entries(stats)) {
    if (s.total >= 3 && s.successRate < MIN_SUCCESS_RATE) {
      auditStore.log({
        type: "PLAYBOOK_ALERT",
        action,
        severity: "WARNING",
        message: `Low success rate: ${s.successRate}%`
      });

      console.warn(
        `[Playbook Monitor] ${action} success only ${s.successRate}%`
      );
    }
  }
}
