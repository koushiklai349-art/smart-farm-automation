import { getFailures } from "../recovery/failure.counter.js";
import { isQuarantined } from "../recovery/device.quarantine.js";
import { addHealthEvent } from "./health.history.store.js";
import { recordFailureCorrelation } from "../failure/failure.correlation.store.js";
import { onHealthChange } from "./health.action.engine.js";
import { calculateHealthScore } from "./health.score.engine.js";
import { alertOnHealthScore } from "../core/alert/alert.manager.js";
import { checkPredictiveRisk } from "../predictive/predictive.alert.engine.js";
import {setSystemMode,SYSTEM_MODE} from "../recovery/recovery.state.js";
import { store } from "../store.js";


// 🔒 TASK-62: persistence timestamp
const HEALTH_TS_KEY = "__systemHealthTS";
const HEALTH_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// 🔒 TASK-62: persistence keys
const HEALTH_SCORE_KEY = "__systemHealthScore";
const HEALTH_TREND_KEY = "__healthTrend";

// 🔒 TASK-61: health trend buffer
const TREND_WINDOW = 5;           // last 5 samples
const TREND_INTERVAL_MS = 30_000; // same as recovery interval
const healthTrend = [];           // [{ t, score }]

let hasRecentNegativeSignal = false;
let lastHealth = "ok";
// 🔒 TASK-58: unified health weights
const HEALTH_WEIGHTS = {
  command_success: +1,
  command_failed: -3,
  command_retry: -1,
  command_rate_limited: -2
};
// 🔒 TASK-59: health recovery config
const RECOVERY_INTERVAL_MS = 30_000; // 30 sec
const RECOVERY_STEP = 1;             // +1 per interval

let systemHealthScore = 100; // start healthy
const MIN_SCORE = 0;
const MAX_SCORE = 100;
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
// 🔁 TASK-62: restore persisted health state
// 🔁 TASK-62: restore persisted health state
try {
  const savedTs = Number(localStorage.getItem(HEALTH_TS_KEY));
  const nowTs = Date.now();

  if (!savedTs || nowTs - savedTs > HEALTH_TTL_MS) {
    // stale snapshot → reset
    localStorage.removeItem(HEALTH_SCORE_KEY);
    localStorage.removeItem(HEALTH_TREND_KEY);
    localStorage.removeItem(HEALTH_TS_KEY);
  } else {
    const savedScore = Number(localStorage.getItem(HEALTH_SCORE_KEY));
    if (!Number.isNaN(savedScore)) {
      systemHealthScore = clamp(savedScore, MIN_SCORE, MAX_SCORE);
    }

    const savedTrend = JSON.parse(localStorage.getItem(HEALTH_TREND_KEY));
    if (Array.isArray(savedTrend)) {
      healthTrend.splice(0, healthTrend.length, ...savedTrend);
    }
  }
} catch {
  // ignore corrupted storage
}
// 🧪 TASK-63: debug-only helpers
export function __debugDropHealth(amount = 10) {
  systemHealthScore = clamp(
    systemHealthScore - amount,
    MIN_SCORE,
    MAX_SCORE
  );
  localStorage.setItem(HEALTH_SCORE_KEY, String(systemHealthScore));
  localStorage.setItem(HEALTH_TS_KEY, String(Date.now()));
  return systemHealthScore;
}

export function __debugBoostHealth(amount = 10) {
  systemHealthScore = clamp(
    systemHealthScore + amount,
    MIN_SCORE,
    MAX_SCORE
  );
  localStorage.setItem(HEALTH_SCORE_KEY, String(systemHealthScore));
  localStorage.setItem(HEALTH_TS_KEY, String(Date.now()));
  return systemHealthScore;
}

export function applyHealthSignal(type) {
  const delta = HEALTH_WEIGHTS[type] || 0;

  // 🔒 TASK-59: mark negative activity
  if (delta < 0) {
    hasRecentNegativeSignal = true;
  }

  systemHealthScore = clamp(
    systemHealthScore + delta,
    MIN_SCORE,
    MAX_SCORE
  );
    // 🔒 TASK-62: persist health score
  localStorage.setItem(HEALTH_SCORE_KEY, String(systemHealthScore));
  localStorage.setItem(HEALTH_TS_KEY, String(Date.now()));
  return systemHealthScore;


}

function getHealthSlope() {
  if (healthTrend.length < 2) return 0;

  const first = healthTrend[0];
  const last = healthTrend[healthTrend.length - 1];
  const dt = (last.t - first.t) / 1000; // seconds
  if (dt <= 0) return 0;

  return (last.score - first.score) / dt; // score per sec
}

export function getHealthTrendSlope() {
  return getHealthSlope();
}

export function getSystemHealthScore() {
  return systemHealthScore;
}


export function getDeviceHealth(devices = []) {
  return devices.map(id => ({
    deviceId: id,
    failures: getFailures(id),
    quarantined: isQuarantined(id)
  }));
}



export function updateSystemHealth(newHealth, deviceIds = []) {
  if (newHealth !== lastHealth) {

    // 🔗 failure correlation
    recordFailureCorrelation({
      type: "HEALTH_CHANGE",
      from: lastHealth,
      to: newHealth
    });

    // 📜 history
    addHealthEvent(newHealth);

    // ⚙️ actions
    onHealthChange(newHealth, lastHealth);

    // 📊 health score (✅ CORRECT PLACE)
    const score = calculateHealthScore(deviceIds, newHealth);
    console.log("📊 System Health Score:", score);

    checkPredictiveRisk(score);

    alertOnHealthScore(score);
        // 🚨 TASK-103: health → system authority sync
    updateSystemModeFromHealth(score);

    window.__healthScore = score;

    lastHealth = newHealth;
  }
    // 🔄 sync health to store + notify UI
 store.system.healthScore = systemHealthScore;

// derive label from score
let label = "good";
if (systemHealthScore < 40) label = "critical";
else if (systemHealthScore < 70) label = "warning";

store.system.health = label;
store.system.lastUpdate = new Date().toLocaleTimeString();


  if (store.notify) {
    store.notify();
  }
}
function updateSystemModeFromHealth(score) {
  if (score >= 80) {
    setSystemMode(SYSTEM_MODE.STABLE);
  } else if (score >= 50) {
    setSystemMode(SYSTEM_MODE.DEGRADED);
  } else {
    setSystemMode(SYSTEM_MODE.CRITICAL);
  }
}

// 🔁 TASK-59: gradual health recovery
setInterval(() => {
  if (hasRecentNegativeSignal) {
    hasRecentNegativeSignal = false; // wait one cycle
    return;
  }

  if (systemHealthScore < MAX_SCORE) {
  systemHealthScore = clamp(
    systemHealthScore + RECOVERY_STEP,
    MIN_SCORE,
    MAX_SCORE
  );

  // 🔒 persist recovered score
  localStorage.setItem(HEALTH_SCORE_KEY, String(systemHealthScore));
  localStorage.setItem(HEALTH_TS_KEY, String(Date.now()));
}

}, RECOVERY_INTERVAL_MS);

// 📈 TASK-61: sample health score for trend
setInterval(() => {
  const now = Date.now();
  healthTrend.push({ t: now, score: systemHealthScore });

  if (healthTrend.length > TREND_WINDOW) {
    healthTrend.shift();
  }

}, TREND_INTERVAL_MS);
