import { apiGet } from "./api.client.js";
import { updateSensorSnapshot } from "../store/sensor.store.js";

export async function syncSensors() {
  const snap = await apiGet("/sensors");
  updateSensorSnapshot(snap);
}
