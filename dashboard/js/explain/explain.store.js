// js/explain/explain.store.js

const _explainMap = new Map();

const _autoExplainEvents = [];

const MAX_AUTO_EVENTS = 50;

const _trustExplain = [];

export function saveExplanation(explain) {
  _explainMap.set(explain.incidentId, explain);
}

export function getExplanationForIncident(id) {
  return _explainMap.get(id);
}


export function addAutoExplainEvent(evt) {
  _autoExplainEvents.unshift({
    ...evt,
    at: evt.at || Date.now()
  });

  if (_autoExplainEvents.length > MAX_AUTO_EVENTS) {
    _autoExplainEvents.pop();
  }
}

export function getAutoExplainEvents() {
  return _autoExplainEvents;
}

export function saveTrustExplain(items) {
  _trustExplain.length = 0;
  _trustExplain.push(...items);
}

export function getTrustExplain() {
  return _trustExplain;
}