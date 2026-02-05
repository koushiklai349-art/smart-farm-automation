import { apiGet } from "./api.client.js";
import { store } from "../store.js";

export async function syncAlerts() {
  const list = await apiGet("/alerts");

  // clear existing alerts safely
  store.alerts.length = 0;

  list.forEach(a => {
    store.alerts.push(a);
  });

  if (store.notify) {
    store.notify();
  }
}
