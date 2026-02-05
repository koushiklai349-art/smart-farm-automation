// dashboard/js/pages/history/history.page.js

import { auditStore } from "../../audit/audit.store.js";
import { EmptyState } from "../../components/empty.state.js";

/**
 * Utility: parse query params from hash
 */
function getParams() {
  const hash = window.location.hash || "";
  const qIndex = hash.indexOf("?");
  if (qIndex === -1) return {};
  return Object.fromEntries(
    new URLSearchParams(hash.slice(qIndex + 1))
  );
}

/**
 * Utility: human-friendly message
 */
function formatMessage(log) {
  return (
    log.message ||
    log.reason ||
    log.action ||
    log.stage ||
    log.type ||
    "—"
  );
}

/**
 * Utility: timestamp normalize
 */
function formatTime(log) {
  const ts = log.at || log.time || log.timestamp;
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "—";
  }
}

export function HistoryPage() {
  const params = getParams();
  const deviceFilter = params.deviceId || null;

  let logs = auditStore.getAll() || [];

  // newest first
  logs = logs.slice().sort((a, b) => {
    const ta = a.at || a.time || a.timestamp || 0;
    const tb = b.at || b.time || b.timestamp || 0;
    return tb - ta;
  });

  // optional device filter
  if (deviceFilter) {
    logs = logs.filter(
      l =>
        l.deviceId === deviceFilter ||
        l.refId === deviceFilter
    );
  }

  if (!logs.length) {
    return `
      <section class="page history-page">
        <h1>🕓 History</h1>
        ${EmptyState({
          icon: "🕓",
          title: "No history available",
          hint: "System events will appear here over time"
        })}
      </section>
    `;
  }

  return `
    <section class="page history-page">
      <h1>🕓 History</h1>

      ${
        deviceFilter
          ? `<p class="context">
               Showing history for device
               <strong>${deviceFilter}</strong>
             </p>`
          : ""
      }

      <ul class="history-list">
        ${logs
          .map(
            log => `
          <li class="history-item">
            <div class="history-main">
              <span class="history-device">
                ${log.deviceId || log.refId || "SYSTEM"}
              </span>
              <span class="history-type">
                [${log.type || "EVENT"}]
              </span>
              <span class="history-msg">
                ${formatMessage(log)}
              </span>
            </div>
            <div class="history-time">
              ${formatTime(log)}
            </div>
          </li>
        `
          )
          .join("")}
      </ul>
    </section>
  `;
}

// no mount hook needed (pure render)
