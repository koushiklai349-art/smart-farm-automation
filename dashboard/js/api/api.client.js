import { farmContext } from "../farm/farm.context.store.js";

const USE_REAL_API = true;

// 🔒 global api health state
let apiOnline = true;
let retryDelay = 2000; // start with 2s
const MAX_DELAY = 30000;

export function isApiOnline() {
  return apiOnline;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export async function apiGet(path) {
  if (!USE_REAL_API) {
    const mod = await import(`./mock${path}.js`);
    return mod.default();
  }

  const farmId = farmContext.get();

  try {
    const res = await fetch(`http://localhost:3000/api/dashboard${path}`, {
      headers: farmId ? { "X-Farm-Id": farmId } : {}
    });

    if (!res.ok) throw new Error("HTTP " + res.status);

    // ✅ backend is back
    apiOnline = true;
    retryDelay = 2000;

    return res.json();
  } catch (err) {
    // ❌ backend down
    apiOnline = false;

    console.warn("[API] offline → backing off", retryDelay);
    await sleep(retryDelay);

    retryDelay = Math.min(retryDelay * 2, MAX_DELAY);
    throw err;
  }
}

