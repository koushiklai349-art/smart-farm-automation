// js/explain/explain.timeline.builder.js

export function buildExplainTimeline({ incident, recoveryEvents = [] }) {
  const timeline = [];

  // Incident events
  incident.events.forEach(e => {
    timeline.push({
      at: e.at || e.timestamp,
      type: "EVENT",
      label: `${e.type} on ${incident.deviceId}`,
      meta: e,
    });
  });

  // Recovery events (optional)
  recoveryEvents.forEach(r => {
    timeline.push({
      at: r.at,
      type: "RECOVERY",
      label: r.label,
      meta: r,
    });
  });

  // sort by time
  timeline.sort((a, b) => a.at - b.at);
  return timeline;
}
