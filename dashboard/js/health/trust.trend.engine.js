// dashboard/js/health/trust.trend.engine.js
import { getAllTrust } from "./trust.store.js";

const history = new Map(); // deviceId -> [{t, s}]
const WINDOW_MS = 5 * 60 * 1000; // 5 min window
const SAMPLE_LIMIT = 20;

export function sampleTrust() {
  const now = Date.now();

  getAllTrust().forEach(({ deviceId, score }) => {
    const arr = history.get(deviceId) || [];
    arr.push({ t: now, s: score });

    // keep window
    const trimmed = arr.filter(p => now - p.t <= WINDOW_MS);
    if (trimmed.length > SAMPLE_LIMIT) {
      trimmed.splice(0, trimmed.length - SAMPLE_LIMIT);
    }
    history.set(deviceId, trimmed);
  });
}

export function getTrustSlope(deviceId) {
  const arr = history.get(deviceId);
  if (!arr || arr.length < 2) return 0;

  const first = arr[0];
  const last = arr[arr.length - 1];
  const dtSec = (last.t - first.t) / 1000;
  if (dtSec <= 0) return 0;

  return (last.s - first.s) / dtSec; // score per second
}
