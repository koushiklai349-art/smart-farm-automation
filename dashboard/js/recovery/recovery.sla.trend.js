import { getRecoveryDurations } from "./recovery.timeline.store.js";
import { raiseAlert } from "../core/alert/alert.manager.js";
import {isEscalationActive, activateEscalation} from "./recovery.sla.state.js";

const WINDOW = 5;
const WARNING_THRESHOLD = 3;

export function checkRecoverySLATrend() {
  const durations = getRecoveryDurations().slice(-WINDOW);

  if (durations.length < WINDOW) return;

  let warningCount = 0;

  durations.forEach(d => {
    if (d.durationMs >= 3 * 60 * 1000 &&
        d.durationMs < 6 * 60 * 1000) {
      warningCount++;
    }
  });

 if (warningCount >= WARNING_THRESHOLD &&
    !isEscalationActive()) {

    raiseAlert(
      {
        code: "RECOVERY_SLA_ESCALATION",
        severity: "critical",
        message: "Recovery SLA trend worsening (auto escalation)"
      },
      {
        window: WINDOW,
        warnings: warningCount
      }
    );
  }
  activateEscalation();
}
