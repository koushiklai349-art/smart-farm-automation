const DEV = true; // later false

export function log(...args) {
  if (DEV) console.log(...args);
}

export function warn(...args) {
  if (DEV) console.warn(...args);
}

// 🔒 TASK-63: debug flag
export const DEBUG_MODE =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("debug") === "true";
