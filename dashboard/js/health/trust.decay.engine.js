// dashboard/js/health/trust.decay.engine.js

import { getAllTrust, setTrust } from "./trust.store.js";

// decay config
const DECAY_PER_MINUTE = 0.1; // very slow natural decay
const DECAY_INTERVAL_MS = 60_000; // 1 min

let decayTimer = null;

export function startTrustDecayEngine() {
  if (decayTimer) return;

  decayTimer = setInterval(() => {
    const now = Date.now();

    getAllTrust().forEach(entry => {
      const { deviceId, score, lastUpdatedAt } = entry;
      const minutes =
        (now - lastUpdatedAt) / 60000;

      if (minutes <= 0) return;

      const decayed =
        score - minutes * DECAY_PER_MINUTE;

      setTrust(deviceId, decayed);
    });
  }, DECAY_INTERVAL_MS);
}

export function stopTrustDecayEngine() {
  clearInterval(decayTimer);
  decayTimer = null;
}
