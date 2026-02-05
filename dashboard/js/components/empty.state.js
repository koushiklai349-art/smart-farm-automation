export function EmptyState({ icon = "ℹ️", title, hint }) {
  return `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${hint}</p>
    </div>
  `;
}
