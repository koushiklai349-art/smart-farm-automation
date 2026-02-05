import { store } from "../store.js";
import { ScheduleCard } from "../components/schedule.card.js";

export function SchedulePage() {
  setTimeout(bindScheduleToggles, 0);

  return `
    <section class="page schedule-page">
      <h1>⏰ Schedules</h1>

      <div class="schedule-grid">
        ${store.schedules.map(s =>
          ScheduleCard(s)
        ).join("")}
      </div>
    </section>
  `;
}

function bindScheduleToggles() {
  document
    .querySelectorAll(".schedule-toggle")
    .forEach(box => {
      box.addEventListener("change", () => {
        const schedule = store.schedules.find(
          s => s.id === box.dataset.id
        );

        if (schedule) {
          schedule.enabled = box.checked;

          // 🔁 notify UI / future engine
          if (store.notify) {
            store.notify();
          }
        }
      });
    });
}
