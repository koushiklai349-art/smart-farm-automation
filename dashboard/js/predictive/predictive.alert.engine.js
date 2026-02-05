import { getRecentFailures } from "../failure/failure.correlation.store.js";
import { raiseAlert } from "../core/alert/alert.manager.js";

let lastScore = 100;
const CONFIDENCE_THRESHOLD = 2;

export function checkPredictiveRisk(currentScore) {
  const recentFailures = getRecentFailures(10);

  const highFailureRate = recentFailures.length >= 5;
  const scoreDrop = lastScore - currentScore;
  const rapidDrop = scoreDrop >= 20;

  let confidence = 0;
  const reasons = [];

  if (highFailureRate) {
    confidence += 1;
    reasons.push("HIGH_RECENT_FAILURES");
  }

  if (rapidDrop) {
    confidence += 1;
    reasons.push("RAPID_SCORE_DROP");
  }

  if (confidence >= CONFIDENCE_THRESHOLD) {
    const severity =
      confidence >= 3 ? "critical" : "warning";

    raiseAlert(
      {
        code: "PREDICTIVE_SYSTEM_RISK",
        severity,
        message:
          "System is likely to go CRITICAL soon"
      },
      {
        recentFailures: recentFailures.length,
        scoreDrop,
        confidence,
        reasons
      }
    );
  }

  lastScore = currentScore;
}
