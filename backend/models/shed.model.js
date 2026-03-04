const mongoose = require("mongoose");

const shedSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true,
    },
    capacity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shed", shedSchema);