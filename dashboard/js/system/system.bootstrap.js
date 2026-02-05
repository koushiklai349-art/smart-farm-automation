// js/system/system.bootstrap.js
const DEV_MODE = true; // 🔒 false করলেই real ESP32 mode

import { registerEngine, beat } from "./engine.heartbeat.js";
import { monitorPlaybookEffectiveness } from "../recovery/playbook/recovery.playbook.monitor.js";
import { decayActionWeights } from "../recovery/playbook/recovery.playbook.weight.store.js";
import { initAckListener } from "../command/command.ack.listener.js";
import { getMQTT } from "../mqtt/mqtt.client.js";
import { subscribeMQTT } from "../mqtt/mqtt.subscribe.js";
import { deviceStore } from "../devices/device.store.js";
import { startTrustDecayEngine } from "../health/trust.decay.engine.js";
import { sampleTrust } from "../health/trust.trend.engine.js";
import { checkEarlyWarnings } from "../health/trust.warning.engine.js";
import { buildTrustExplain } from "../explain/trust.explain.builder.js";
import { saveTrustExplain } from "../explain/explain.store.js";

const state = {
  status: "idle",
  error: null,
};

export function getBootstrapStatus() {
  return state;
}

export async function bootstrapSystem() {
  if (state.status !== "idle") return;

   state.status = "booting";
   console.group("[BOOTSTRAP]");

   try {
    // load core engines (same as old implicit load)
    await import("../store/store.notifier.js");

  
    //subscribeMQTT();
    
   // ✅ static import, no fetch error

    const mqtt = getMQTT();
    initAckListener(mqtt);

    console.log("[BOOTSTRAP] MQTT subscriptions + ACK listener ready");



    // 🧪 TASK-169: Fake ESP32 (DEV_MODE only)
    if (DEV_MODE) {
    const fake = await import("../utils/fake.esp32.js");
    fake.initFakeESP32();
    console.warn("[DEV_MODE] Fake ESP32 simulator active");
    }

    await import("../rule-engine/rule.engine.js");
    const autoAction = await import("../auto-action/auto.action.engine.js");
    autoAction.initAutoActionEngine();
    await import("../recovery/recovery.engine.js");

    state.status = "ready";
    
    // ⏱️ Phase-2: device online/offline monitor
    setInterval(() => {
       const now = Date.now();

       const devices = deviceStore.getAll();
       devices.forEach(device => {
       // 30s no telemetry → offline
        if (now - device.lastSeen > 30000) {
       deviceStore.markOffline(device.deviceId);
        }
      });
    }, 5000); // check every 5 seconds
    
    startTrustDecayEngine();
    console.log("[BOOTSTRAP] Trust decay engine started");

    console.log("[BOOTSTRAP] core engines ready");
    // 🫀 TEMP: register bootstrap heartbeat (system level)
     registerEngine("system", { interval: 5000 });
     setInterval(() => {
     beat("system");
     } , 3000);
    
     // 🔮 Phase 9.2 — trust sampling & early warning
    setInterval(() => {
    sampleTrust();
    checkEarlyWarnings();
    }, 30_000); // every 30s

    // 🧠 Phase 9.4 — trust explain refresh
    setInterval(() => {
    const explain = buildTrustExplain();
    saveTrustExplain(explain);
    }, 60_000); // every 1 min

     // 🔁 check playbook health every 5 min
    setInterval(() => {
    monitorPlaybookEffectiveness();
    }, 5 * 60 * 1000);
    await import("./engine.heartbeat.monitor.js")
   .then(m => m.startHeartbeatMonitor());
    
   // 🔁 decay playbook confidence every 10 minutes
    setInterval(() => {
    decayActionWeights();
    }, 10 * 60 * 1000);

    } catch (err) {
    state.status = "failed";
    state.error = err;
    window.__BOOTSTRAP_ERROR__ = err;
    console.error("[BOOTSTRAP] FAILED", err);
    }

   console.groupEnd();

}

