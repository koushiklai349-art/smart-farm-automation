// dashboard/js/farm/farm.context.store.js

const FARM_KEY = "ACTIVE_FARM_ID";

let currentFarmId = localStorage.getItem(FARM_KEY);

export const farmContext = {
  get() {
    return currentFarmId;
  },

  set(farmId) {
    currentFarmId = farmId;
    localStorage.setItem(FARM_KEY, farmId);
    window.dispatchEvent(new CustomEvent("farm:changed", {
      detail: { farmId }
    }));
  },

  clear() {
    currentFarmId = null;
    localStorage.removeItem(FARM_KEY);
  },

  hasFarm() {
    return !!currentFarmId;
  }
};
