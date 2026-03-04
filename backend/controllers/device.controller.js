const { runtime } = require("../store/runtime.store");

exports.unlockDevice = (req, res) => {

  const { deviceId } = req.params;

  if (!runtime.lockedDevices?.[deviceId]) {
    return res.status(400).json({ error: "DEVICE_NOT_LOCKED" });
  }

  delete runtime.lockedDevices[deviceId];

  console.log("🔓 Device UNLOCKED:", deviceId);

  res.json({
    success: true,
    deviceId,
    status: "UNLOCKED"
  });
};