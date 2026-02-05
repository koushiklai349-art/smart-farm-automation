export function ScheduleCard({
  id,
  name,
  module,
  action,
  time,
  enabled
}) {
  return `
    <div class="schedule-card ${enabled ? "on" : "off"}">
      <h4>${name}</h4>
      <p>${module}</p>
      <p><strong>${action}</strong> at ${time}</p>

      <label>
        <input
          type="checkbox"
          class="schedule-toggle"
          data-id="${id}"
          ${enabled ? "checked" : ""}
        >
        Enabled
      </label>
    </div>
  `;
}

