// dashboard/js/explain/trust.explain.builder.js
import { getTrustSlope } from "../health/trust.trend.engine.js";
import { getAllTrust } from "../health/trust.store.js";

export function buildTrustExplain() {
  const list = getAllTrust();

  return list
    .filter(t => t.score <= 55)
    .map(t => {
      const slope = getTrustSlope(t.deviceId);

      return {
        deviceId: t.deviceId,
        score: Math.round(t.score),
        slope: Number(slope.toFixed(3)),
        reason:
          slope < 0
            ? "Trust declining over time"
            : "Trust below safe threshold",
        at: Date.now()
      };
    });
}
