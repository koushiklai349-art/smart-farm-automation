/**
 * TASK-141.3.1
 * Correlate recovery timeline events into incidents
 *
 * Input:
 *  - timeline: array of events (DESC sorted by ts)
 *
 * Output:
 *  - incidents: [
 *      {
 *        id,
 *        deviceId,
 *        startedAt,
 *        endedAt,
 *        durationMs,
 *        retryCount,
 *        status, // OPEN | RECOVERED | MANUAL_RELEASE
 *        events: []
 *      }
 *    ]
 */

const END_TYPES = new Set(["RECOVERED", "MANUAL_RELEASE"]);
const START_TYPE = "FAILURE";

export function correlateRecoveryIncidents(timeline = []) {
  if (!Array.isArray(timeline) || timeline.length === 0) {
    return [];
  }

  // group by device
  const byDevice = {};
  for (const e of timeline) {
    const id = e.refId || "SYSTEM";
    if (!byDevice[id]) byDevice[id] = [];
    byDevice[id].push(e);
  }

  const incidents = [];

  Object.entries(byDevice).forEach(([deviceId, events]) => {
    // events are DESC; process oldest → newest
    const ordered = [...events].sort((a, b) => a.ts - b.ts);

    let current = null;

    for (const ev of ordered) {
      // start new incident
      if (ev.type === START_TYPE && !current) {
        current = createIncident(deviceId, ev);
        continue;
      }

      if (!current) continue;

      current.events.push(ev);

      if (ev.type === "RETRY") {
        current.retryCount++;
      }

      // close incident
      if (END_TYPES.has(ev.type)) {
        current.endedAt = ev.ts;
        current.durationMs = current.endedAt - current.startedAt;
        current.status = ev.type;
        incidents.push(current);
        current = null;
      }
    }

    // dangling open incident
    if (current) {
      current.status = "OPEN";
      incidents.push(current);
    }
  });

  // newest incident first
  return incidents.sort((a, b) => b.startedAt - a.startedAt);
}

function createIncident(deviceId, startEvent) {
  return {
    id: `${deviceId}-${startEvent.ts}`,
    deviceId,
    startedAt: startEvent.ts,
    endedAt: null,
    durationMs: null,
    retryCount: 0,
    status: "OPEN",
    events: [startEvent]
  };
}
