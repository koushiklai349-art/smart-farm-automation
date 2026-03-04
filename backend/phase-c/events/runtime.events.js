const listeners = [];

function emitRuntimeEvent(event) {
  listeners.forEach((fn) => fn(event));
}

function onRuntimeEvent(fn) {
  listeners.push(fn);
}

module.exports = {
  emitRuntimeEvent,
  onRuntimeEvent
};
