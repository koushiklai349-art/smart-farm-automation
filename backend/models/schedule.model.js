const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true
    },
    time: {
      type: String, // "HH:MM"
      required: true
    },
    action: {
      target: { type: String, required: true },
      value: { type: String, enum: ["ON", "OFF"], required: true }
    },
    enabled: {
      type: Boolean,
      default: true
    },
    lastExecutedAt: {
      type: String, // "YYYY-MM-DD HH:MM"
      default: null
    },
    daysOfWeek: {
      type: [Number], // 0=Sunday, 1=Monday ... 6=Saturday
      default: [0,1,2,3,4,5,6] // default = every day
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);