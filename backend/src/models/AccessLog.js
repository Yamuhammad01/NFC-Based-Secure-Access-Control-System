const mongoose = require("mongoose");
const { ACCESS_RESULT } = require("../config/constants");

const accessLogSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      uppercase: true,
    },
    userName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    readerId: {
      type: String,
      required: true,
      uppercase: true,
    },
    door: {
      type: String,
      required: true,
    },
    result: {
      type: String,
      enum: Object.values(ACCESS_RESULT),
      required: true,
    },
    // Optional reason (revoked, insufficient access, anti-passback, etc.)
    reason: {
      type: String,
      default: null,
    },
    // Explicit timestamp for the event
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false } // We use the explicit 'timestamp' field
);

// Index for fast lookups
accessLogSchema.index({ uid: 1, timestamp: -1 });
accessLogSchema.index({ readerId: 1, timestamp: -1 });

module.exports = mongoose.model("AccessLog", accessLogSchema);
