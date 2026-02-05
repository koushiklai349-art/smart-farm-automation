import { getSystemHealthScore } from "../health/system.health.js";
import { getSystemMode, SYSTEM_MODE } from "../recovery/recovery.state.js";
import { getRecoveryTimeline } from "../recovery/recovery.timeline.store.js";
//import { getQuarantinedDevices } from "../recovery/device.quarantine.js";

const MAX_SCORE = 100;

export function calculateSystemStabilityScore() {
  let score = MAX_SCORE;
  const breakdown = [];

  // 1️⃣ Health score (50%)
  const health = getSystemHealthScore(); // 0–100
  const healthContribution = Math.round(health * 0.5);
  score = healthContribution;
  breakdown.push({
    factor: "Health",
    value: healthContribution
  });

  // 2️⃣ SLA breaches (last 1 hour)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const timeline = getRecoveryTimeline();

  let slaPenalty = 0;
  timeline.forEach(e => {
    if (e.type === "SLA_BREACH" && e.ts >= oneHourAgo) {
      if (e.meta?.level === "critical") slaPenalty += 15;
      else if (e.meta?.level === "warning") slaPenalty += 5;
    }
  });

  score -= slaPenalty;
  breakdown.push({
    factor: "SLA",
    penalty: slaPenalty
  });

  // 3️⃣ Quarantined devices
  //const quarantined = getQuarantinedDevices?.() || [];
  //const quarantinePenalty = quarantined.length * 5;
  //score -= quarantinePenalty;

  //breakdown.push({
    //factor: "Quarantine",
   // penalty: quarantinePenalty
 // });

  // 4️⃣ Recovery state penalty
  const mode = getSystemMode();
  if (mode === SYSTEM_MODE.RECOVERING) {
    score -= 10;
    breakdown.push({
      factor: "Recovery",
      penalty: 10
    });
  }

  // clamp
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    breakdown
  };
}
