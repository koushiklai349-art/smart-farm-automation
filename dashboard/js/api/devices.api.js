import { apiGet } from "./api.client.js";
import { deviceStore } from "../devices/device.store.js";

export async function syncDevices() {
  const list = await apiGet("/devices");
  list.forEach(d => {
    deviceStore.update(d.deviceId, d);
  });
}
