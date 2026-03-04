import { deviceStore } from "../devices/device.store.js";
import { loadPage } from "../router.js";

export function DevicePage(params) {
  console.log("[DevicePage] called with params:", params);
  const deviceId = params?.id;
  const device = deviceStore.get(deviceId);

  if (!device) {
    return `
      <h1>Device not found</h1>
      <button onclick="loadPage('overview')">← Back</button>
    `;
  }

  return `
    <h1>📟 Device: ${device.deviceId}</h1>

    <button onclick="loadPage('overview')">← Back</button>

    <section class="card" style="margin-top:12px;">
      <p><strong>Status:</strong> ${device.status}</p>
      <p><strong>Farm:</strong> ${device.farmId || "-"}</p>
      <p><strong>Species:</strong> ${device.species || "-"}</p>
      <p><strong>Last Seen:</strong> ${new Date(device.lastSeen).toLocaleString()}</p>
    </section>

    <section class="card" style="margin-top:12px;">
      <h3>🔒 Controls</h3>
      <p>Controls enabled in L27</p>
    </section>
  `;
}
