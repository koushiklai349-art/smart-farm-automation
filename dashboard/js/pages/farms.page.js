// dashboard/js/pages/farms.page.js
import { farmContext } from "../farm/farm.context.store.js";
import { loadPage } from "../router.js";

const FARMS = [
  { id: "farm-1", name: "🌾 Green Valley Farm" },
  { id: "farm-2", name: "🐄 Dairy Farm Alpha" },
  { id: "farm-3", name: "🐔 Poultry Zone" }
];

export function FarmsPage() {
  return `
    <section class="page">
      <h1>Select a Farm</h1>

      <div class="dashboard-grid">
        ${FARMS.map(f => `
          <div class="card farm-card" data-id="${f.id}">
            <h3>${f.name}</h3>
            <p>Farm ID: ${f.id}</p>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

window.onFarmsMounted = function () {
  document.querySelectorAll(".farm-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      console.log("FARM CLICKED:", id);
      farmContext.set(id);
      loadPage("overview");
    });
  });
};

