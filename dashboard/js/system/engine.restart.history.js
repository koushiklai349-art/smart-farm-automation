// js/system/engine.restart.history.js

const history = [];

/**
 * Add restart event
 */
export function recordRestart(event) {
  history.unshift({
    ...event,
    timestamp: Date.now(),
  });

  // keep last 50
  if (history.length > 50) {
    history.pop();
  }
}

/**
 * Get all restart history
 */
export function getRestartHistory() {
  return history;
}

/**
 * Get history by engine
 */
export function getRestartHistoryByEngine(engineName) {
  return history.filter(h => h.engine === engineName);
}
