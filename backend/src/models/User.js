const mongoose = require("mongoose");
const { ROLES, STATUS } = require("../config/constants");

const userSchema = new mongoose.Schema(
  {
    // NFC Card UID (unique identifier for the user's primary credential)
    uid: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
    },
    accessLevel: {
      type: Number,
      enum: [1, 2, 3],
      default: 1,
    },
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
    },
    // Anti-passback tracking
    isInside: {
      type: Boolean,
      default: false,
    },
    // Time-based access window (24h format HH:mm)
    allowedTime: {
      start: { type: String, default: "08:00" },
      end: { type: String, default: "18:00" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
