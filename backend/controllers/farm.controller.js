const Farm = require("../models/farm.model");

exports.createFarm = async (req, res) => {
  try {
    const farm = await Farm.create(req.body);
    res.status(201).json(farm);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getFarms = async (req, res) => {
  try {
    const farms = await Farm.find();
    res.json(farms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};