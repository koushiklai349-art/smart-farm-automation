import { load, save } from "../utils/persist.js";

const history = load("audit.history", []);

const MAX_HISTORY = 500;
export function addAuditEntry(entry) {
  const normalized = {
    ...entry,
    at: entry.at || new Date().toISOString()
  };

  history.unshift(normalized);

  if (history.length > 200) history.pop();
  save("audit.history", history);
}


export function getAuditHistory() {
  return [...history];
}
