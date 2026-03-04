const { syncToCloud } =
require("./cloud.sync.service");

const SYNC_INTERVAL = 60 * 1000; // 1 minute

function startCloudSync() {

  setInterval(async () => {

    await syncToCloud();

  }, SYNC_INTERVAL);

  console.log("☁️ Cloud sync scheduler started");

}

module.exports = {
  startCloudSync
};