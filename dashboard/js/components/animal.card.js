export function AnimalCard({ label, value, page }) {
  return `
    <div class="animal-card" data-page="${page}">
      <h4>${label}</h4>
      <p>${value}</p>
    </div>
  `;
}
