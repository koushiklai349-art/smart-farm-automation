import { AuditPanel } from "../components/audit.panel.js";

export function AuditPage() {
  // Phase-1 goal: page must render, no blank
  // Panel already handles data + timeline
  return `
    <section class="page audit-page">
      <h1>🛡️ Audit Logs</h1>
      ${AuditPanel()}
    </section>
  `;
}
