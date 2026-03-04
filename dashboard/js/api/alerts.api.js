import { apiGet, isApiOnline } from "./api.client.js";
import { store } from "../store.js";

export async function syncAlerts() {
  if (!isApiOnline()) return;

  try {
    const list = await apiGet("/alerts");

    store.alerts.length = 0;
    list.forEach(a => store.alerts.push(a));

    store.notify?.();
  } catch {
    // silent
  }
}


