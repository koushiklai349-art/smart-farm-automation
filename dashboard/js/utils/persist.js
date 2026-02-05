export function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function load(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
