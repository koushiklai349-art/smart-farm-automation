const mongoose = require("mongoose");

const lineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    shedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shed",
      required: true,
    },
    type: {
      type: String,
      enum: ["feed", "water", "climate", "lighting", "custom"],
      default: "custom",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Line", lineSchema);