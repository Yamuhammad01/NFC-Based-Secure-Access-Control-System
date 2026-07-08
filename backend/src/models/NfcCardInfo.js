const mongoose = require("mongoose");
const { ROLES, STATUS } = require("../config/constants");

// ─── Replacement History Sub-document ────────────────────────────────────────
const replacementHistorySchema = new mongoose.Schema(
  {
    oldUid: { type: String, uppercase: true, trim: true },
    newUid: { type: String, uppercase: true, trim: true },
    replacedAt: { type: Date, default: Date.now },
    replacedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users", default: null },
    replacedByName: { type: String, default: "" },
    reason: { type: String, default: "replacement" },
  },
  { _id: false }
);

// ─── Main NFC Card Schema ─────────────────────────────────────────────────────
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

    // Card lifecycle status
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
    },

    // Reason for revocation / suspension
    revokeReason: {
      type: String,
      enum: ["lost", "stolen", "damaged", "misuse", "replaced", null],
      default: null,
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

    // Last time this card was scanned at a reader
    lastUsed: {
      type: Date,
      default: null,
    },

    // Timestamps for status transitions
    revokedAt: {
      type: Date,
      default: null,
    },
    suspendedAt: {
      type: Date,
      default: null,
    },
    reactivatedAt: {
      type: Date,
      default: null,
    },

    // Admin who issued/replaced this card
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },

    // Whether this card was issued as a replacement for another card
    isReplacement: {
      type: Boolean,
      default: false,
    },

    // Reference to the previous card (if this is a replacement)
    replacedCardRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NfcCardInfo",
      default: null,
    },

    // Full replacement history log
    replacementHistory: {
      type: [replacementHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Indexes for fast lookups
nfcCardInfoSchema.index({ status: 1 });
nfcCardInfoSchema.index({ userRef: 1 });

module.exports = mongoose.model("NfcCardInfo", nfcCardInfoSchema);