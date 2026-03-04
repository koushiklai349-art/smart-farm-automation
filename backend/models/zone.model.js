const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },
    type: {
      type: String,
      enum: ["poultry", "cow", "goat", "fish", "custom"],
      default: "custom",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Zone", zoneSchema);