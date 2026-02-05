const correlations = [];

export const failureCorrelationStore = {
  recordFailureCorrelation,
  getFailuresByDevice,
  getRecentFailures,
};

// record any failure event
export function recordFailureCorrelation(event) {
  correlations.push({
    ...event,
    timestamp: Date.now()
  });

  // keep last 100 only
  if (correlations.length > 100) {
    correlations.shift();
  }
  window.dispatchEvent(
  new CustomEvent("FAILURE_STATE_UPDATED")
);

}

// query helpers
export function getFailuresByDevice(deviceId) {
  return correlations.filter(c => c.deviceId === deviceId);
}

export function getRecentFailures(limit = 10) {
  return correlations.slice(-limit);
}
