const axios = require("axios");
const { runtime } = require("../store/runtime.store");

const CLOUD_ENDPOINT =
  process.env.CLOUD_ENDPOINT ||
  "https://farm-cloud.example.com/api/sync";

async function syncToCloud() {

  try {

    const payload = {
      timestamp: new Date().toISOString(),
      devices: runtime.devices,
      health: runtime.health,
      metrics: runtime.metrics,
      incidents: runtime.incidents?.history || [],
      energy: runtime.energy
    };

    const res = await axios.post(
      CLOUD_ENDPOINT,
      payload
    );

    console.log("☁️ Cloud sync success");

    runtime.globalAI.lastSync =
      new Date().toISOString();

    return res.data;

  } catch (err) {

    console.error(
      "☁️ Cloud sync failed:",
      err.message
    );

  }
}

module.exports = {
  syncToCloud
};