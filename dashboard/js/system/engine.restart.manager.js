import { ENGINE_RESTART_POLICY } from "./engine.restart.policy.js";
import { registerEngine } from "./engine.heartbeat.js";
import { recordRestart } from "./engine.restart.history.js";

const retryCount = new Map();

export function attemptEngineRestart(engineName, startFn) {
  const count = retryCount.get(engineName) || 0;

  if (count >= ENGINE_RESTART_POLICY.maxRetries) {
    console.warn("[RESTART] Max retries reached for", engineName);
    return;
  }

  retryCount.set(engineName, count + 1);

  console.warn(
    `[RESTART] Restarting ${engineName} (attempt ${count + 1})`
  );

 setTimeout(() => {
  try {
    startFn();
    
    // ✅ record success
    recordRestart({
      engine: engineName,
      status: "success",
      attempt: count + 1,
    });
    window.dispatchEvent(
  new CustomEvent("ENGINE_RESTART_UPDATED")
);
  } catch (err) {
    console.error("[RESTART] Failed:", engineName, err);

    // ❌ record failure
    recordRestart({
      engine: engineName,
      status: "failed",
      attempt: count + 1,
      error: err?.message || "unknown",
    });
    window.dispatchEvent(
  new CustomEvent("ENGINE_RESTART_UPDATED")
);
  }
}, ENGINE_RESTART_POLICY.retryDelayMs);

}
