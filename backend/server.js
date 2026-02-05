const express = require('express');
const fs = require('fs');
const app = express();
const path = require("path");

app.use(express.json());

const STORE_FILE = path.join(__dirname, "store.json");

const OFFLINE_AFTER_SEC = 30;

// ---------------- LOAD / SAVE ----------------
let store = {
  devices: {}, commandQueue: {}, sensorData: {},
  rules: [], schedules: [], commandHistory: {},
  auditLogs: [],
  metrics: {
    commandsSent: 0,
    commandsSuccess: 0,
    commandsFailed: 0,
    devicesOnline: 0,
    devicesOffline: 0
  },
  config: { maxRetries: 3, retryAfterSec: 20, offlineHold: true }
};

if (fs.existsSync(STORE_FILE)) {
  store = JSON.parse(fs.readFileSync(STORE_FILE));
}

function saveStore() {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

// ---------------- AUDIT ----------------
function audit(event, payload = {}) {
  store.auditLogs.push({
    event,
    payload,
    time: new Date().toISOString()
  });
  saveStore();
}

// ---------------- DEVICE STATUS ----------------
function updateDeviceStatus() {
  let online = 0, offline = 0;
  const now = Date.now();

  Object.values(store.devices).forEach(d => {
    const last = new Date(d.lastSeen).getTime();
    d.status = (now - last) / 1000 > OFFLINE_AFTER_SEC ? 'OFFLINE' : 'ONLINE';
    d.status === 'ONLINE' ? online++ : offline++;
  });

  store.metrics.devicesOnline = online;
  store.metrics.devicesOffline = offline;
  saveStore();
}

/*function authenticate(req, res, next) {

  const { username, password } = req.headers;

  const user = store.users?.[username];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = user;
  next();
}*/

// ---------------- COMMAND QUEUE ----------------
function queueCommand(deviceId, action, source = 'MANUAL') {
  if (!store.commandQueue[deviceId]) store.commandQueue[deviceId] = [];
  const cmd = {
    id: Date.now() + '-' + Math.random(),
    action,
    source,
    retries: 0,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  store.commandQueue[deviceId].push(cmd);
  store.metrics.commandsSent++;
  audit('COMMAND_QUEUED', cmd);
  saveStore();
}

// ---------------- RECOVERY ----------------
function recoveryLoop() {
  Object.entries(store.commandQueue).forEach(([deviceId, cmds]) => {
    cmds.forEach(cmd => {
      if (cmd.status !== 'FAILED') return;
      if (cmd.retries >= store.config.maxRetries) return;

      const last = new Date(cmd.lastTriedAt || cmd.createdAt).getTime();
      if ((Date.now() - last) / 1000 >= store.config.retryAfterSec) {
        cmd.retries++;
        cmd.status = 'PENDING';
        audit('COMMAND_RETRY', cmd);
      }
    });
  });
  saveStore();
}

// ---------------- LOOPS ----------------
setInterval(updateDeviceStatus, 20000);
setInterval(recoveryLoop, 10000);

// ---------------- APIs ----------------

// register
app.post('/api/devices/register', (req, res) => {
  const d = req.body;
  store.devices[d.deviceId] = {
    ...d,
    lastSeen: new Date().toISOString(),
    status: 'ONLINE'
  };
  store.commandQueue[d.deviceId] = store.commandQueue[d.deviceId] || [];
  store.commandHistory[d.deviceId] = store.commandHistory[d.deviceId] || [];
  audit('DEVICE_REGISTERED', d);
  saveStore();
  res.json({ success: true });
});

// heartbeat
app.post('/api/devices/:id/heartbeat', (req, res) => {
  const id = req.params.id;
  store.devices[id].lastSeen = new Date().toISOString();
  store.devices[id].status = 'ONLINE';
  audit('HEARTBEAT', { deviceId: id });
  saveStore();
  res.json({ success: true });
});

// send command
app.post('/api/devices/:id/command', (req, res) => {
  const id = req.params.id;
    if (!store.devices[id]) {
    return res.status(404).json({
      success: false,
      message: "Device not registered"
    });
  }

  if (store.devices[id].status === 'OFFLINE' && store.config.offlineHold) {
    audit('COMMAND_HELD_OFFLINE', { deviceId: id });
    return res.json({ success: false, message: 'Device offline' });
  }
  queueCommand(id, req.body.action, req.body.source || 'MANUAL');
  res.json({ success: true });
});

// pull commands
app.get('/api/devices/:id/commands', (req, res) => {
  const id = req.params.id;
  const cmds = store.commandQueue[id] || [];
  const send = [];

  cmds.forEach(c => {
    if (c.status === 'PENDING') {
      c.status = 'SENT';
      c.lastTriedAt = new Date().toISOString();
      send.push(c);
    }
  });

  saveStore();
  res.json(send);
});

// command result
app.post('/api/devices/:id/command-result', (req, res) => {
  const { commandId, result } = req.body;
  const list = store.commandQueue[req.params.id] || [];
  const cmd = list.find(c => c.id === commandId);

  if (!cmd) return res.json({ success: false });

  if (result === 'OK') {
    cmd.status = 'DONE';
    store.metrics.commandsSuccess++;
    audit('COMMAND_SUCCESS', cmd);
  } else {
    cmd.status = 'FAILED';
    store.metrics.commandsFailed++;
    audit('COMMAND_FAILED', cmd);
  }

  saveStore();
  res.json({ success: true });
});

// 📊 METRICS
app.get('/api/metrics', (req, res) => {
  res.json(store.metrics);
});

// 📜 AUDIT LOGS
app.get('/api/audit-logs', (req, res) => {
  res.json(store.auditLogs.slice(-100)); // last 100
});

// 📱 MOBILE DASHBOARD SNAPSHOT
app.get("/api/mobile/farm/:farmId", (req, res) => {

  const farmId = req.params.farmId;

  const devices = Object.values(store.devices)
    .filter(d => d.farmId === farmId);

  const snapshot = devices.map(device => {

    const id = device.deviceId;

    return {
      deviceId: id,
      species: device.species,
      sensorData: store.sensorData[id] || {},
      score: store.farmScore?.[id] || {},
      aiPrediction: store.aiPredictions?.[id] || {},
      recommendation: store.recommendations?.[id] || {},
      financial: store.financials?.[id] || {}
    };
  });

  res.json({
    farmId,
    devices: snapshot
  });
});


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
