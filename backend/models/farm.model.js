const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    timezone: {
     type: String,
     default: "Asia/Kolkata"
    },
    mode: {
      type: String,
      enum: ["offline-first", "hybrid"],
      default: "offline-first",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Farm", farmSchema);