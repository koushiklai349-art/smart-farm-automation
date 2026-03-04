const ControllerClass = require("../models/controllerClass.model");

exports.createControllerClass = async (req, res) => {
  try {
    const controller = await ControllerClass.create(req.body);
    res.status(201).json(controller);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getControllerClasses = async (req, res) => {
  try {
    const controllers = await ControllerClass.find();
    res.json(controllers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};