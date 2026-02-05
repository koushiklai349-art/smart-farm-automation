/**
 * TASK-143.1
 * Build exportable incident report (CSV / JSON)
 */

export function buildIncidentReport(incident) {
  if (!incident || !incident.events) return null;

  const base = {
    incidentId: incident.id,
    deviceId: incident.deviceId,
    status: incident.status,
    startedAt: new Date(incident.startedAt).toISOString(),
    endedAt: incident.endedAt
      ? new Date(incident.endedAt).toISOString()
      : null,
    durationMs: incident.durationMs,
    retryCount: incident.retryCount
  };

  const events = incident.events.map(e => ({
    time: new Date(e.ts).toISOString(),
    type: e.type,
    message: e.message || "",
    meta: e.meta || {}
  }));

  return { base, events };
}

export function exportIncidentJSON(incident) {
  const report = buildIncidentReport(incident);
  if (!report) return;

  download(
    JSON.stringify(report, null, 2),
    `incident_${incident.id}.json`,
    "application/json"
  );
}

export function exportIncidentCSV(incident) {
  const report = buildIncidentReport(incident);
  if (!report) return;

  const rows = [
    ["Incident ID", report.base.incidentId],
    ["Device ID", report.base.deviceId],
    ["Status", report.base.status],
    ["Started At", report.base.startedAt],
    ["Ended At", report.base.endedAt || ""],
    ["Duration (ms)", report.base.durationMs || ""],
    ["Retry Count", report.base.retryCount]
  ];

  const eventRows = report.events.map(e => [
    e.time,
    e.type,
    `"${e.message.replace(/"/g, '""')}"`
  ]);

  const csv = [
    "Key,Value",
    ...rows.map(r => r.join(",")),
    "",
    "Event Time,Event Type,Message",
    ...eventRows.map(r => r.join(","))
  ].join("\n");

  download(
    csv,
    `incident_${incident.id}.csv`,
    "text/csv"
  );
}

/* util */
function download(data, filename, type) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
