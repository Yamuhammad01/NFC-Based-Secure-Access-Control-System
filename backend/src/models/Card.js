const mongoose = require("mongoose");
const { CARD_STATUS } = require("../config/constants");

const cardSchema = new mongoose.Schema(
  {
    // The simulated NFC UID (e.g., "A1B2C3D4")
    uid: { type: String, required: true, unique: true, uppercase: true },

    // Owner
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Lifecycle status
    status: {
      type: String,
      enum: Object.values(CARD_STATUS),
      default: CARD_STATUS.ACTIVE,
    },

    // Card replacement chain
    replacedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      default: null,
    },

    // Validity window
    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },

    // Revocation metadata
    revokedAt: { type: Date, default: null },
    revocationReason: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Card", cardSchema);
