// dashboard/js/recovery/recovery.state.js

/**
 * SYSTEM MODES (Single Source of Truth)
 */
export const SYSTEM_MODE = {
  STABLE: "STABLE",
  RECOVERING: "RECOVERING",
  DEGRADED: "DEGRADED",
  CRITICAL: "CRITICAL"
};

let recoveryInProgress = false;
let systemMode = SYSTEM_MODE.STABLE;
let lastSystemMode = systemMode;

// 🔒 TASK-109: system mode history listeners
const systemModeListeners = [];

/**
 * Subscribe to system mode changes
 */
export function onSystemModeChange(fn) {
  if (typeof fn === "function") {
    systemModeListeners.push(fn);
  }
}

function notifySystemModeChange(from, to, reason = null) {
  const event = {
    from,
    to,
    time: Date.now()
  };

  systemModeListeners.forEach(fn => {
    try {
      fn(event);
    } catch (e) {
      console.warn("[SYSTEM_MODE_LISTENER_ERROR]", e);
    }
  });
}

/**
 * Recovery শুরু হলে call হবে
 */
export function markRecoveryStart(deviceId) {
  recoveryInProgress = true;
  updateSystemMode(SYSTEM_MODE.RECOVERING);
}

/**
 * Recovery শেষ হলে call হবে
 */
export function markRecoveryEnd(deviceId) {
  recoveryInProgress = false;
  updateSystemMode(SYSTEM_MODE.STABLE);
}

/**
 * System-wide recovery চলছে কিনা
 */
export function isRecoveryInProgress() {
  return recoveryInProgress === true;
}

/**
 * Current system mode
 */
export function getSystemMode() {
  return systemMode;
}

/**
 * Explicit system mode override
 * (Failure detector / health engine use করবে)
 */
export function setSystemMode(mode) {
  if (!Object.values(SYSTEM_MODE).includes(mode)) return;
  updateSystemMode(mode);
}

/**
 * Internal mode updater (TASK-109)
 */
function updateSystemMode(nextMode, reason = null) {
  if (systemMode === nextMode) return;

  const previous = systemMode;
  systemMode = nextMode;

  notifySystemModeChange(previous, nextMode, reason);
}


/**
 * Stable shortcut (guards use করবে)
 */
export function isSystemStable() {
  return systemMode === SYSTEM_MODE.STABLE;
}
