const Zone = require("../models/zone.model");

exports.createZone = async (req, res) => {
  try {
    const zone = await Zone.create(req.body);
    res.status(201).json(zone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getZones = async (req, res) => {
  try {
    const zones = await Zone.find().populate("farmId");
    res.json(zones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};