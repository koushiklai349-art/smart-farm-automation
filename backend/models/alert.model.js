const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["CONTROLLER_OFFLINE", "LOW_HEALTH", "COMMAND_FAILURE"],
      required: true
    },
    deviceId: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },
    message: {
      type: String,
      required: true
    },
    resolved: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);