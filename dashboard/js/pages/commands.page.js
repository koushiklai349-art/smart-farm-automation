import { store } from "../store.js";
import { CommandCard } from "../components/command.card.js";
import { normalizeCommandState } from "./commands.status.normalizer.js";
import { dispatchCommand } from "../command/command.dispatcher.js";
import { hasOutcome } from "../command/command.outcome.store.js";
import { deviceStore } from "../devices/device.store.js";


let unsubscribe = null;

export function CommandsPage() {
  queueMicrotask(bindButtons);

  setTimeout(() => {
  populateDeviceSelector();
  bindButtons();
  bindToggles();
  }, 0);


  return `
    <section class="page commands-page">
      <h1>🎮 Manual Commands</h1>

      <div class="device-selector">
        <label>
           Device:
           <select id="command-device-select"></select>
        </label>
      </div>

      <div class="command-grid">
        ${store.commands
          .map(cmd => renderCommand(cmd))
          .join("")}
      </div>
    </section>
  `;
  
}

function renderCommand(cmd) {
  const outcome =
    cmd.outcomeStatus || null; // optional wiring later

  const uiState = normalizeCommandState({
    commandStatus: cmd.status,
    outcomeStatus: outcome,
    blockedReason: cmd.blockedReason
  });

  return CommandCard({
    ...cmd,
    uiState
  });
}

function bindButtons() {
  document
    .querySelectorAll(".cmd-btn")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        const template = store.commands.find(
          c => c.id === btn.dataset.id
        );
        if (!template) return;

        // 🖥 pick an online device (Phase-3 simple logic)
       const select = document.getElementById("command-device-select");
       const deviceId = select?.value;
       const device = deviceStore.get(deviceId);

       if (!device || device.status !== "online") {
        alert("Selected device is not online");
         return;
      }


        if (!device) {
          alert("No online device available");
          return;
        }

       const id = generateCommandId();

       const command = {
       ...template,
       id,
       commandId: id,              // 🔒 IMPORTANT
       deviceId: device.deviceId,
       timestamp: Date.now(),
       source: "manual"
       };

       dispatchCommand(command);

      });
    });
}

function bindToggles() {
  document
    .querySelectorAll(".cmd-toggle")
    .forEach(tg => {
      tg.addEventListener("change", () => {
        const template = store.commands.find(
          c => c.id === tg.dataset.id
        );
        if (!template) return;

        // 🖥 pick first online device (Phase-3 simple)
        const select = document.getElementById("command-device-select");
        const deviceId = select?.value;
        const device = deviceStore.get(deviceId);

        if (!device) {
          alert("No online device available");
          tg.checked = !tg.checked; // rollback UI
          return;
        }

        const id = crypto.randomUUID();

        dispatchCommand({
          ...template,
          id,
          commandId: id,
          deviceId: device.deviceId,
          action: tg.checked ? "ON" : "OFF",
          timestamp: Date.now(),
          source: "manual"
        });
      });
    });
}


function generateCommandId() {
  return crypto.randomUUID();
}

function populateDeviceSelector() {
  const select = document.getElementById("command-device-select");
  if (!select) return;

  const devices = deviceStore.getAll();
  select.innerHTML = "";

  if (devices.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No devices online";
    select.appendChild(opt);
    return;
  }

  devices.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.deviceId;
    opt.textContent = `${d.deviceId} (${d.status})`;
    if (d.status !== "online") opt.disabled = true;
    select.appendChild(opt);
  });

  // auto-select first online
  const firstOnline = devices.find(d => d.status === "online");
  if (firstOnline) select.value = firstOnline.deviceId;
}

function syncTogglesFromDeviceState() {
  const select = document.getElementById("command-device-select");
  if (!select) return;

  const deviceId = select.value;
  const device = deviceStore.get(deviceId);
  if (!device?.actuators) return;

  document.querySelectorAll(".cmd-toggle").forEach(tg => {
    const template = store.commands.find(
      c => c.id === tg.dataset.id
    );
    if (!template?.target) return;

    const state = device.actuators[template.target];
    if (!state) return;

    tg.checked = state === "ON";
  });
}

/**
 * Mount hook (router compatible)
 */
export function onCommandsMounted() {
  if (store.subscribe) {
    
      store.subscribe(() => {
      syncTogglesFromDeviceState();
    });
    unsubscribe = store.subscribe(() => {
      const root =
        document.getElementById("page-container");
      if (root) root.innerHTML = CommandsPage();
    });
  }

  return () => unsubscribe?.();
}

window.onCommandsMounted = onCommandsMounted;
