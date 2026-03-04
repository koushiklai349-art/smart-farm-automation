const mongoose = require("mongoose");

const controllerInstanceSchema = new mongoose.Schema(
  {
    lineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Line",
      required: true,
    },
    controllerClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ControllerClass",
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    firmwareVersion: {
      type: String,
      default: "1.0.0",
    },
    healthScore: {
     type: Number,
     default: 100
   },
    offlineCount: {
     type: Number,
     default: 0
   },
  
    status: {
      type: String,
      enum: ["online", "offline", "error"],
      default: "offline",
    },
    lastHeartbeat: {
      type: Date,
    },
    role: {
  type: String,
  enum: ["PRIMARY", "BACKUP"],
  default: "PRIMARY"
}
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ControllerInstance ||
  mongoose.model("ControllerInstance", controllerInstanceSchema);