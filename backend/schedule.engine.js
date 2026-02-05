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
  const now = new Date();

  return now.toTimeString().slice(0, 5); // HH:MM
}

function queueCommand(deviceId, action) {

  const override =
    store.overrideMode?.[deviceId]?.[action.target] || "AUTO";

  // 🔥 Override wins
  if (override === "FORCE_OFF" && action.value === "ON") return;
  if (override === "FORCE_ON" && action.value === "OFF") return;

  // 🔥 Rule actuator state check
  const current =
    store.actuatorState?.[deviceId]?.[action.target];

  if (current === action.value) return;

  store.commandQueue[deviceId] =
    store.commandQueue[deviceId] || [];

  store.commandQueue[deviceId].push({
    id: Date.now() + "-" + Math.random(),
    action,
    source: "SCHEDULE",
    retries: 0,
    status: "PENDING",
    createdAt: new Date().toISOString()
  });
}


function evaluateSchedules() {

  loadStore();

  const now = getCurrentTime();

  store.schedules?.forEach(schedule => {

    if (!schedule.enabled) return;

    if (schedule.time !== now) return;

    queueCommand(schedule.deviceId, schedule.action);

       console.log(
         `⏰ Schedule executed → ${schedule.deviceId}`,
       schedule.action
      );
  });

  saveStore();
}

setInterval(evaluateSchedules, 60000);

console.log("⏰ Schedule engine started");
