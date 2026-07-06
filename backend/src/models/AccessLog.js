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
    // Link to Users model for relational lookups
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
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
    direction: {
      type: String,
      enum: ["in", "out"],
      default: "in",
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
accessLogSchema.index({ userRef: 1, timestamp: -1 });

module.exports = mongoose.model("AccessLog", accessLogSchema);