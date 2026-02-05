const history = [];

export function addHealthEvent(health, reason = null) {
  history.push({
    health,
    time: new Date().toLocaleTimeString(),
    reason
  });

  if (history.length > 20) {
    history.shift();
  }
}

export function getHealthHistory() {
  return history;
}
