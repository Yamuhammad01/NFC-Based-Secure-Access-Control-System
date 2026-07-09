const mongoose = require("mongoose");

const temporaryAccessSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      enum: ["30min", "1hr", "2hrs", "4hrs", "half", "full"],
    },
    durationLabel: {
      type: String,
      required: true,
      trim: true,
    },
    staffId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "expired"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },
    reviewNotes: {
      type: String,
      default: null,
      trim: true,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for fast lookups
temporaryAccessSchema.index({ ticketId: 1 });
temporaryAccessSchema.index({ userRef: 1, submittedAt: -1 });
temporaryAccessSchema.index({ status: 1 });
temporaryAccessSchema.index({ staffId: 1 });

module.exports = mongoose.model("TemporaryAccess", temporaryAccessSchema);