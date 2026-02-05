export function FailureCard({ id, module, component, reason, status }) {
  return `
    <div class="failure-card ${status}">
      <h4>${module} – ${component}</h4>
      <p>${reason}</p>
      <small>ID: ${id}</small>

      ${
        status === "failed"
          ? `<button data-id="${id}" class="retry-btn">Retry</button>`
          : `<span class="status-text">${status.toUpperCase()}</span>`
      }
    </div>
  `;
}
