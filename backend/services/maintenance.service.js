const { runtime } = require("../store/runtime.store");
const { saveRuntime } = require("../store/runtime.persistence");

function enableMaintenance(reason = "MANUAL_ACTIVATION") {
  runtime.maintenance = {
    enabled: true,
    reason,
    activatedAt: new Date().toISOString()
  };

  saveRuntime();
  return runtime.maintenance;
}

function disableMaintenance() {
  runtime.maintenance = {
    enabled: false,
    reason: null,
    activatedAt: null
  };

  saveRuntime();
  return runtime.maintenance;
}

function isMaintenanceActive() {
  return runtime.maintenance?.enabled === true;
}

module.exports = {
  enableMaintenance,
  disableMaintenance,
  isMaintenanceActive
};