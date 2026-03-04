import { apiGet, isApiOnline } from "./api.client.js";
import { deviceStore } from "../devices/device.store.js";

export async function syncDevices() {
  if (!isApiOnline()) return;

  try {
    const list = await apiGet("/devices");
    list.forEach(d => {
      deviceStore.update(d.deviceId, d);
    });
  } catch {
    // silent — handled by api.client
  }
}
