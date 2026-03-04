const Line = require("../models/line.model");

exports.createLine = async (req, res) => {
  try {
    const line = await Line.create(req.body);
    res.status(201).json(line);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getLines = async (req, res) => {
  try {
    const lines = await Line.find().populate({
      path: "shedId",
      populate: {
        path: "zoneId",
        populate: { path: "farmId" }
      }
    });
    res.json(lines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};