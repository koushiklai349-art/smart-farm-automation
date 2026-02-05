// 🔽 Alert Export Utilities (CSV / JSON)

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

export function exportAlertsAsJSON(alerts) {
  const content = JSON.stringify(alerts, null, 2);
  downloadFile(
    `alerts-${Date.now()}.json`,
    content,
    "application/json"
  );
}

export function exportAlertsAsCSV(alerts) {
  const header = [
    "timestamp",
    "code",
    "severity",
    "message",
    "deviceId",
    "count"
  ];

  const rows = alerts.map(a => [
    new Date(a.timestamp).toISOString(),
    a.code,
    a.severity,
    `"${a.message.replace(/"/g, '""')}"`,
    a.context?.deviceId || "",
    a.count || 1
  ]);

  const csv =
    header.join(",") +
    "\n" +
    rows.map(r => r.join(",")).join("\n");

  downloadFile(
    `alerts-${Date.now()}.csv`,
    csv,
    "text/csv"
  );
}
