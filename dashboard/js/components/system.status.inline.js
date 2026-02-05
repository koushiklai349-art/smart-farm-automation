import { store } from "../store.js";
import { getAllTrust } from "../health/trust.store.js";

function renderTrustWarningBanner() {
  const items = getAllTrust().filter(
    t => t.score <= 55
  );

  if (items.length === 0) return "";

  return `
    <div class="banner warning">
      ⚠️ Early Warning:
      ${items
        .map(
          t =>
            `${t.deviceId} trust ${Math.round(t.score)}`
        )
        .join(", ")}
    </div>
  `;
}

export function renderSystemStatusInline() {
  const s = store.system || {};

 return `
  ${renderTrustWarningBanner()}
  <div class="system-status-inline">
    <span>🟢 Mode: ${s.mode ?? "—"}</span>
    <span>❤️ Health: ${s.health ?? "—"}</span>
    <span>⚡ Power: ${store.power ?? "—"}</span>
    <span>🌐 Network: ${store.network ?? "—"}</span>
    <span>🧠 Confidence: ${s.confidence ?? "—"}</span>
  </div>
`;

}
