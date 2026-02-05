// js/prediction/prediction.store.js

const _predictionMap = new Map();

export function savePrediction(deviceId, prediction) {
  _predictionMap.set(deviceId, prediction);
}

export function getPrediction(deviceId) {
  return _predictionMap.get(deviceId);
}

export function getAllPredictions() {
  return Array.from(_predictionMap.entries());
}
