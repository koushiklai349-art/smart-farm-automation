// js/system/engine.heartbeat.monitor.js
import { attemptEngineRestart } from "./engine.restart.manager.js";
import { getAllHeartbeatStatus } from "./engine.heartbeat.js";
import { raiseAlert } from "../core/alert/alert.manager.js";
import { ALERT_TYPES } from "../core/alert/alert.types.js";

/**
 * Monitor all engine heartbeats
 */
export function startHeartbeatMonitor() {
  setInterval(() => {
    const now = Date.now();

    for (const [name, hb] of getAllHeartbeatStatus()) {
      if (now - hb.lastBeat > hb.interval * 2) {
        if (hb.status !== "missed") {
          hb.status = "missed";

          raiseAlert(ALERT_TYPES.ENGINE_HEARTBEAT_MISSED, {
            engine: name,
            lastBeat: hb.lastBeat,
          });

          console.warn("[HEARTBEAT MISSED]", name);
            // 🛠️ TASK-100: auto restart hook
          if (hb.startFn) {
          attemptEngineRestart(name, hb.startFn);
          }
        }
      }
    }
  }, 2000);
}
