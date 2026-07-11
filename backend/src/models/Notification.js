const mongoose = require("mongoose");

/**
 * Notification Model
 * Stores all events related to a user: card access attempts, system events,
 * admin approvals/denials of temporary access requests, card activation, etc.
 * Each notification is scoped to a user's UID so we can filter per authenticated user.
 */
const notificationSchema = new mongoose.Schema(
  {
    // UID of the card/user this notification belongs to
    uid: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    // Link to Users model for relational lookups
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },
    // Notification type — maps to the frontend's type field
    type: {
      type: String,
      enum: ["card_used", "unauthorized", "suspicious", "system"],
      required: true,
    },
    // Severity maps to frontend colour scheme
    severity: {
      type: String,
      enum: ["info", "danger", "warning", "success"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: null,
    },
    readerId: {
      type: String,
      default: null,
    },
    // Whether the user has dismissed this notification
    dismissed: {
      type: Boolean,
      default: false,
    },
    // Explicit timestamp for when the event occurred
    eventTimestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for fast per-user queries
notificationSchema.index({ uid: 1, eventTimestamp: -1 });
notificationSchema.index({ uid: 1, dismissed: 1, eventTimestamp: -1 });

module.exports = mongoose.model("Notification", notificationSchema);