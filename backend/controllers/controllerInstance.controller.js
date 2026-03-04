const ControllerInstance = require("../models/controllerinstance.model");

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["online", "offline", "error"].includes(status)) {
      return res.status(400).json({ error: "INVALID_STATUS" });
    }

    const updated = await ControllerInstance.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "NOT_FOUND" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "SERVER_ERROR" });
  }
};
exports.createControllerInstance = async (req, res) => {
  try {
    const instance = await ControllerInstance.create(req.body);
    res.status(201).json(instance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getControllerInstances = async (req, res) => {
  try {
    const instances = await ControllerInstance.find()
      .populate({
        path: "lineId",
        populate: {
          path: "shedId",
          populate: {
            path: "zoneId",
            populate: { path: "farmId" }
          }
        }
      })
      .populate("controllerClassId");

    res.json(instances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.heartbeat = async (req, res) => {
  try {
    const { deviceId } = req.body;

    const instance = await ControllerInstance.findOneAndUpdate(
      { deviceId },
      {
        status: "online",
        lastHeartbeat: new Date()
      },
      { new: true }
    );

    if (!instance) {
      return res.status(404).json({ error: "Device not found" });
    }

    res.json({
      success: true,
      deviceId,
      status: instance.status,
      lastHeartbeat: instance.lastHeartbeat
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};