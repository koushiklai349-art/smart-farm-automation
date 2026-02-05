import { farmContext } from "./farm.context.store.js";

const FARM_META = {
  "farm-1": { name: "🌾 Green Valley Farm" },
  "farm-2": { name: "🐄 Dairy Farm Alpha" },
  "farm-3": { name: "🐔 Poultry Zone" }
};

export function getActiveFarm() {
  const id = farmContext.get();
  if (!id) return null;

  return {
    id,
    ...(FARM_META[id] || { name: id })
  };
}
