const mongoose = require("mongoose");
const { ROLES, STATUS } = require("../config/constants");

const nfcCardInfoSchema = new mongoose.Schema(
  {
    // NFC Card UID (unique identifier for the physical card)
    uid: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    // Link to the user (Staff/Student) this card is assigned to
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },
    // Cardholder name (denormalized for quick access)
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
    // Card lifecycle dates
    issuedDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: () => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 4); // 4 years default
        return d;
      },
    },
    // Admin who issued/replaced this card
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NfcCardInfo", nfcCardInfoSchema);