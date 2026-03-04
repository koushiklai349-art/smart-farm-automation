const mongoose = require("mongoose");

const commandSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    commandId: { type: String, required: true, unique: true },
   payload: {
  type: Object,
  required: true,
  validate: {
    validator: function (value) {
      if (value.target && value.operation) return true;
      if (value.action) return true; // backward compatibility
      return false;
    },
    message: "Invalid payload structure"
  }
  },

    source: {
      type: String,
      enum: ["EMERGENCY", "MANUAL", "SCHEDULE", "AI", "SYSTEM"],
      default: "SYSTEM"
    },

    priority: { type: Number, default: 0 },
    issuedBy: {
  type: String
},
issuedByRole: {
  type: String
},
issuedAt: {
  type: Date
},
ipAddress: {
  type: String
},

    status: {
      type: String,
      enum: [
        "pending",
        "allowed",
        "blocked",
        "sent",
        "executed",
        "failed",
        "retrying",
        "expired",
        "rolled_back"
      ],
      default: "pending",
      index: true
    },

    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },

    expiresAt: { type: Date },

    error: { type: String },
    failureReason: { type: String }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Command ||
  mongoose.model("Command", commandSchema);