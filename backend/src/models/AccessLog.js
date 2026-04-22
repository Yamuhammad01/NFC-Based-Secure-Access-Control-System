const mongoose = require("mongoose");
const { ACCESS_RESULT, DENIAL_REASON } = require("../config/constants");

const accessLogSchema = new mongoose.Schema(
  {
    // Who tapped
    card: { type: mongoose.Schema.Types.ObjectId, ref: "Card", default: null },
    uid: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // Where
    reader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reader",
      required: true,
    },
    zone: { type: String, required: true },

    // Result
    result: {
      type: String,
      enum: Object.values(ACCESS_RESULT),
      required: true,
    },

    // Denial detail (null if granted)
    denialReason: {
      type: String,
      enum: [...Object.values(DENIAL_REASON), null],
      default: null,
    },

    // Direction for anti-passback
    direction: {
      type: String,
      enum: ["entry", "exit"],
      required: true,
    },

    // Timestamp (auto via Mongoose, but explicit for queries)
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for fast querying by user, time range, and result
accessLogSchema.index({ user: 1, timestamp: -1 });
accessLogSchema.index({ reader: 1, timestamp: -1 });
accessLogSchema.index({ result: 1 });

module.exports = mongoose.model("AccessLog", accessLogSchema);
