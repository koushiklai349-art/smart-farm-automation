import { farmContext } from "../farm/farm.context.store.js";

const USE_REAL_API = true; // 🔁 false = mock, true = backend

export async function apiGet(path) {
  if (!USE_REAL_API) {
    const mod = await import(`./mock${path}.js`);
    return mod.default();
  }

  const farmId = farmContext.get();
  const res = await fetch(`http://localhost:3000/api/dashboard${path}`, {
    headers: farmId ? { "X-Farm-Id": farmId } : {}
  });

  if (!res.ok) throw new Error(`API failed: ${path}`);
  return res.json();
}
