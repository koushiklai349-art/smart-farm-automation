const mongoose = require("mongoose");

const controllerClassSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      default: "1.0.0",
    },
    supportedDevices: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ControllerClass", controllerClassSchema);