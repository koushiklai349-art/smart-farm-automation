import { apiGet, isApiOnline } from "./api.client.js";
import { updateSensor } from "../store/sensor.store.js";

export async function syncSensors() {
  if (!isApiOnline()) return;

  try {
    const data = await apiGet("/sensors");

    Object.entries(data).forEach(([key, value]) => {
      updateSensor(key, value);
    });
  } catch {
    // silent
  }
}
