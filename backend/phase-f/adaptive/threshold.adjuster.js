const { persistent } = require("../../store/persistent.store");
const { runtime } = require("../../store/runtime.store");
const { savePersistent } = require("../../store/persistent.store");

function adjustThresholds(deviceId) {

  const adaptive =
    runtime.adaptive?.devices?.[deviceId];

  if (!adaptive) return;

  const rules = persistent.rules || [];

  for (let rule of rules) {

    if (rule.deviceId !== deviceId) continue;
    if (!rule.sensor || rule.highThreshold == null) continue;

    // Preserve original baseline once
    if (rule.baseHighThreshold == null) {
      rule.baseHighThreshold = rule.highThreshold;
    }

    if (adaptive.mode === "ECO") {
      rule.highThreshold =
        rule.baseHighThreshold + 2;
    }
    else if (adaptive.mode === "AGGRESSIVE") {
      rule.highThreshold =
        rule.baseHighThreshold - 2;
    }
    else {
      rule.highThreshold =
        rule.baseHighThreshold;
    }
  }

  runtime.adaptive.devices[deviceId].lastAdjusted =
    Date.now();

  savePersistent();
}

module.exports = {
  adjustThresholds
};