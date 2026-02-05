// device.store.js
import { notifyUI } from "./store.notifier.js";


const devices = new Map();

export const deviceStore = {
  update(id, state) {
    const prev = devices.get(id) || {};
    devices.set(id, { ...prev, ...state });
    notifyUI();
  },

  get(id) {
    return devices.get(id); 
  }
};
