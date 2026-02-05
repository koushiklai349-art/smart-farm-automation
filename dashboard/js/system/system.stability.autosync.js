import { calculateSystemStabilityScore } from "./system.stability.engine.js";
import {
  getSystemMode,
  setSystemMode,
  SYSTEM_MODE
} from "../recovery/recovery.state.js";
import { isRecoveryInProgress } from "../recovery/recovery.state.js";

const CHECK_INTERVAL_MS = 30 * 1000; // 30s

setInterval(() => {
  // 🚫 do not interfere during recovery
  if (isRecoveryInProgress()) return;

  const { score } = calculateSystemStabilityScore();
  const currentMode = getSystemMode();

  // 🔴 critical
  if (score < 40 && currentMode !== SYSTEM_MODE.CRITICAL) {
    setSystemMode(
      SYSTEM_MODE.CRITICAL,
      "STABILITY_SCORE_LOW"
    );
    return;
  }

  // 🟡 degraded
  if (
    score >= 40 &&
    score < 70 &&
    currentMode === SYSTEM_MODE.STABLE
  ) {
    setSystemMode(
      SYSTEM_MODE.DEGRADED,
      "STABILITY_SCORE_MEDIUM"
    );
    return;
  }

  // 🟢 stable
  if (
    score >= 80 &&
    currentMode !== SYSTEM_MODE.STABLE
  ) {
    setSystemMode(
      SYSTEM_MODE.STABLE,
      "STABILITY_SCORE_RECOVERED"
    );
  }

}, CHECK_INTERVAL_MS);
