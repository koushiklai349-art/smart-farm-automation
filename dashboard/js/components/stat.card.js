export function StatCard({ label, value, status }) {
  return `
    <div class="stat-card ${status}">
      <h4>${label}</h4>
      <p>${value}</p>
    </div>
  `;
}
