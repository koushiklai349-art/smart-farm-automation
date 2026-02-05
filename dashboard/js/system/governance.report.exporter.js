import { buildGovernanceReport } from "./governance.report.builder.js";

export function exportGovernanceReportJSON() {
  const report = buildGovernanceReport();

  const blob = new Blob(
    [JSON.stringify(report, null, 2)],
    { type: "application/json;charset=utf-8;" }
  );

  download(blob, "governance_report.json");
}

export function exportGovernanceReportCSV() {
  const r = buildGovernanceReport();

  const rows = [
    ["Generated At", r.generatedAt],
    ["System Mode", r.system.mode],
    ["Health Score", r.system.healthScore],
    ["Operator Trust", r.system.operatorTrustScore],
    ["Override Active", r.override.active],
    ["Policy Versions", r.policy.historyCount],
    ["Recovery Attempts (24h)", r.recovery.attempts],
    ["Recovery Success (24h)", r.recovery.success],
    ["Recovery Success Rate (%)", r.recovery.successRate]
  ];

  const csv = rows.map(r => `"${r[0]}","${r[1]}"`).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  download(blob, "governance_report.csv");
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
