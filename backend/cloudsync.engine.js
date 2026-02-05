const fs = require("fs");

const STORE_FILE = "./store.json";
let store = JSON.parse(fs.readFileSync(STORE_FILE));

function loadStore() {
  store = JSON.parse(fs.readFileSync(STORE_FILE));
}

function saveStore() {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

// Fake cloud upload
function sendToCloud(payload) {
  console.log("☁️ Syncing to cloud:", payload.type);
}

function evaluateCloudSync() {

  loadStore();

  store.cloudSyncQueue = store.cloudSyncQueue || [];

  // push sensor snapshot
  Object.entries(store.sensorData || {})
    .forEach(([deviceId, data]) => {

      store.cloudSyncQueue.push({
        type: "sensorSnapshot",
        deviceId,
        data,
        time: Date.now()
      });
    });

  // process queue
  store.cloudSyncQueue.forEach(item => {
    sendToCloud(item);
  });

  // clear queue
  store.cloudSyncQueue = [];

  saveStore();
}

setInterval(evaluateCloudSync, 60000);

console.log("☁️ Cloud sync engine started");
