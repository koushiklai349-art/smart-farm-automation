// dashboard/js/store/store.notifier.js

const listeners = new Set();
let scheduled = false;

function scheduleNotify(cb) {
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(cb);
  } else {
    queueMicrotask(cb);
  }
}

/**
 * Subscribe to store updates
 */
export function subscribe(fn) {
  listeners.add(fn);

  // 🔄 return unsubscribe helper
  return () => listeners.delete(fn);
}

/**
 * Batched UI notify
 */
export function notifyUI() {
  if (scheduled) return;

  scheduled = true;

  scheduleNotify(() => {
    scheduled = false;

    listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error("[store.notify] listener error", e);
      }
    });
  });
}

/**
 * Debug helper
 */
export function getListenerCount() {
  return listeners.size;
}
