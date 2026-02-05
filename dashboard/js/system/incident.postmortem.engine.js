import { getAuditHistory } from "../audit/audit.history.js";
import { getRecoveryTimeline } from "../recovery/recovery.timeline.store.js";
import { calculateOperatorTrustScore } from "./operator.trust.engine.js";

export function generateIncidentPostMortem({
  sinceTs,
  untilTs = Date.now()
}) {
  const audits = getAuditHistory();
  const timeline = getRecoveryTimeline();

  // Filter relevant window
  const windowAudits = audits.filter(
   a => {
  const ts = new Date(a.at).getTime();
  return ts >= sinceTs && ts <= untilTs;
}

  );

  const windowTimeline = timeline.filter(
    e => e.ts >= sinceTs && e.ts <= untilTs
  );

  // Incident summary
  const summary = {
    start: new Date(sinceTs).toISOString(),
    end: new Date(untilTs).toISOString(),
    totalFailures: windowTimeline.filter(e => e.type === "FAILURE").length,
    totalRecoveries: windowTimeline.filter(e => e.type === "RECOVERED").length,
    overridesUsed: windowAudits.filter(
      a => a.type === "OPERATOR_OVERRIDE"
    ).length
  };

  // Root cause (best-effort heuristic)
  let rootCause = "Unknown";
  if (summary.totalFailures > summary.totalRecoveries) {
    rootCause = "Repeated failures without timely recovery";
  } else if (summary.overridesUsed > 0) {
    rootCause = "Manual intervention during unstable conditions";
  }

  const { score: trustScore } = calculateOperatorTrustScore();
  // 🧠 Trust score snapshot
  const trustBefore = calculateOperatorTrustScore({ untilTs: sinceTs })?.score ?? null;
  const trustAfter = calculateOperatorTrustScore({ untilTs })?.score ?? null;
  const explainableSystemActions = windowAudits
  .filter(a => a.type === "AUTO_ACTION")
  .map(a => ({
    action: a.action,
    stage: a.stage,
    deviceId: a.deviceId,
    explain: a.explain || null,
    at: a.at
  }));

  return {
  summary,
  timeline: windowTimeline,

  // 🤖 Decision split
  systemActions: explainableSystemActions,
  operatorActions: windowAudits.filter(
    a => a.type === "OPERATOR_OVERRIDE"
  ),

  // 🧠 Explainability
  explainSummary: {
    autoActions: explainableSystemActions.length,
    blockedActions: explainableSystemActions.filter(
      a => a.stage === "ACTION_BLOCKED"
    ).length
  },

  // 🛡 Trust impact
  operatorTrustImpact: {
    before: trustBefore,
    after: trustAfter,
    delta:
      trustBefore != null && trustAfter != null
        ? trustAfter - trustBefore
        : null
  },

  operatorTrustScore: trustAfter,
  rootCause,

  recommendations: buildRecommendations({
    summary,
    trustScore: trustAfter
  })
};

}

function buildRecommendations({ summary, trustScore }) {
  const rec = [];

  if (summary.totalFailures > 3) {
    rec.push("Investigate recurring device failures");
  }

  if (summary.overridesUsed > 0 && trustScore < 60) {
    rec.push(
      "Limit operator overrides or require confirmation"
    );
  }

  if (rec.length === 0) {
    rec.push("No immediate action required");
  }

  return rec;
}
