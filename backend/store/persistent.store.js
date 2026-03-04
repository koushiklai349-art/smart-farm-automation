const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../persistent.store.json");

let persistent = {
  farms: {},
  devices: {}, // metadata only: deviceId, farmId, species, location
  rules: [],
  schedules: [],
  feedingSchedules: [],
  speciesProfiles: {},
  users: {},
  alerts: {},
  ota: {},
  config: { maxRetries: 3, retryAfterSec: 20, offlineHold: true }
};

if (fs.existsSync(FILE)) {
  persistent = JSON.parse(fs.readFileSync(FILE));
}

function savePersistent() {
  fs.writeFileSync(FILE, JSON.stringify(persistent, null, 2));
}

module.exports = { persistent, savePersistent };
