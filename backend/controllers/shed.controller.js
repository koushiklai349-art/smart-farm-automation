const Shed = require("../models/shed.model");

exports.createShed = async (req, res) => {
  try {
    const shed = await Shed.create(req.body);
    res.status(201).json(shed);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getSheds = async (req, res) => {
  try {
    const sheds = await Shed.find().populate({
      path: "zoneId",
      populate: { path: "farmId" },
    });
    res.json(sheds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};