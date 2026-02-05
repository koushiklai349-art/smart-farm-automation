const mqtt = require("mqtt");
const fs = require("fs");

const STORE_FILE = "./store.json";
let store = JSON.parse(fs.readFileSync(STORE_FILE));

let lastSaveTime = 0;
const SAVE_INTERVAL = 15000; // 15 seconds

function loadStoreFresh() {
  try {
    const diskStore = JSON.parse(fs.readFileSync(STORE_FILE));

    // merge only NEW commands
    Object.entries(diskStore.commandQueue || {}).forEach(([deviceId, cmds]) => {
      store.commandQueue[deviceId] = store.commandQueue[deviceId] || [];

      cmds.forEach(diskCmd => {
        const exists = store.commandQueue[deviceId]
          .some(memCmd => memCmd.id === diskCmd.id);

        if (!exists) {
          store.commandQueue[deviceId].push(diskCmd);
        }
      });
    });

    // config sync (safe)
    store.config = diskStore.config || store.config;
  } catch (e) {
    console.warn("⚠️ Failed to merge store.json");
  }
}

function syncActuatorState(deviceId) {

  const actuators =
    store.actuatorState?.[deviceId] || {};

  Object.entries(actuators).forEach(([target, state]) => {

    console.log(`🔄 Recovery Sync → ${deviceId} ${target}:${state}`);

    store.commandQueue[deviceId] =
      store.commandQueue[deviceId] || [];

    store.commandQueue[deviceId].push({
      id: Date.now() + "-" + Math.random(),
      action: { target, value: state },
      source: "RECOVERY",
      retries: 0,
      status: "PENDING",
      createdAt: new Date().toISOString()
    });
  });
}


function saveStoreThrottled() {
  const now = Date.now();
  if (now - lastSaveTime < SAVE_INTERVAL) return;

  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
  lastSaveTime = now;
}

const client = mqtt.connect("mqtt://broker.hivemq.com");

client.on("connect", () => {
  console.log("🟢 MQTT Bridge connected");
  client.subscribe("smartfarm/+/ack");
  client.subscribe("smartfarm/+/telemetry");
});

client.on("message", (topic, payload) => {
  let data;
  try {
    data = JSON.parse(payload.toString());
  } catch {
    return;
  }

  // ACK handler
  if (topic.endsWith("/ack")) {
    const deviceId = data.device_id;
    const cmdId = data.cmdId;

    const list = store.commandQueue[deviceId] || [];
    const cmd = list.find(c => c.id === cmdId);
    if (!cmd) return;

    if (data.status === "SUCCESS") {
      cmd.status = "DONE";
      cmd.acked = true;
      cmd.retries = 0;
      store.metrics.commandsSuccess++;
    } else {
      cmd.status = "FAILED";
      store.metrics.commandsFailed++;
    }

    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));

    console.log(`✅ ACK processed for ${cmdId}`);
  }

// TELEMETRY handler
if (topic.endsWith("/telemetry")) {
  if (!data.device_id) return;

  const deviceId = data.device_id;

  store.sensorData[deviceId] = {
    ...data,
    receivedAt: new Date().toISOString()
  };

  // 🔥 Recovery Sync
  if (!store.devices?.[deviceId]?.recovered) {
    syncActuatorState(deviceId);

    store.devices[deviceId] =
      store.devices[deviceId] || {};

    store.devices[deviceId].recovered = true;
  }

  saveStoreThrottled();
  console.log(`📡 Telemetry received from ${deviceId}`);
}

});

function shouldRetry(cmd) {
  if (cmd.status !== "FAILED") return false;
  if (cmd.retries >= store.config.maxRetries) return false;

  const last = new Date(cmd.lastTriedAt || cmd.createdAt).getTime();
  const diffSec = (Date.now() - last) / 1000;

  return diffSec >= store.config.retryAfterSec;
}

function publishPendingCommands() {
  loadStoreFresh(); // only bring NEW commands

  Object.entries(store.commandQueue).forEach(([deviceId, cmds]) => {
    cmds.forEach(cmd => {

      // DONE or ACKED is terminal
      if (cmd.status === "DONE" || cmd.acked === true) return;

      // Stop if max retries reached
      if (cmd.status === "FAILED" && cmd.retries >= store.config.maxRetries) {
        console.log(`🛑 Max retries reached for ${deviceId}`);
        return;
      }

      // SENT too long without ACK → mark FAILED
      if (cmd.status === "SENT") {
        const last = new Date(cmd.lastTriedAt || cmd.createdAt).getTime();
        const diffSec = (Date.now() - last) / 1000;

        if (diffSec >= store.config.retryAfterSec) {
          cmd.status = "FAILED";
          console.log(`⏱️ No ACK from ${deviceId}, marking FAILED`);
        }
      }

      // Only send if PENDING or eligible FAILED
      if (cmd.status !== "PENDING" && !shouldRetry(cmd)) return;

      const payload = {
        cmdId: cmd.id,
        target: cmd.action.target,
        action: cmd.action.value
      };

      client.publish(
        `smartfarm/${deviceId}/command`,
        JSON.stringify(payload)
      );

      // Retry bookkeeping
      if (cmd.status === "FAILED") {
        cmd.retries = (cmd.retries || 0) + 1;

        store.auditLogs.push({
          event: "COMMAND_RETRY",
          deviceId,
          commandId: cmd.id,
          retry: cmd.retries,
          time: new Date().toISOString()
        });

        console.log(`🔁 Retry #${cmd.retries} for ${deviceId}`);
      }

      cmd.status = "SENT";
      cmd.lastTriedAt = new Date().toISOString();

      console.log(`📤 Command sent to ${deviceId}`, payload);
    });
  });

  saveStoreThrottled();
}

setInterval(publishPendingCommands, 3000);
