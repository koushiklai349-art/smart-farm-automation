const fs = require("fs");

const STORE_FILE = "./store.json";
let store = JSON.parse(fs.readFileSync(STORE_FILE));

function loadStore() {
  store = JSON.parse(fs.readFileSync(STORE_FILE));
}

function saveStore() {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

function getCurrentTime() {
  return new Date().toTimeString().slice(0, 5);
}

function queueCommand(deviceId, action) {

  store.commandQueue[deviceId] =
    store.commandQueue[deviceId] || [];

  store.commandQueue[deviceId].push({
    id: Date.now() + "-" + Math.random(),
    action,
    source: "FEEDING",
    retries: 0,
    status: "PENDING",
    createdAt: new Date().toISOString()
  });
}

function evaluateFeeding() {

  loadStore();

  const now = getCurrentTime();

  store.feedingSchedules?.forEach(feed => {

    if (!feed.enabled) return;
    if (feed.time !== now) return;

    queueCommand(feed.deviceId, feed.action);

    console.log(
      `🍽 Feeding triggered → ${feed.deviceId}`,
      feed.action
    );
  });

  saveStore();
}

setInterval(evaluateFeeding, 60000);

console.log("🍽 Feeding engine started");
