const mongoose = require("mongoose");
const { ROLES } = require("../config/constants");

const userSchema = new mongoose.Schema(
  {
    // Personal info
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },

    // RBAC
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
    },

    // Department / affiliation
    department: { type: String, trim: true },
    studentId: { type: String, unique: true, sparse: true },

    // Status
    isActive: { type: Boolean, default: true },

    // Linked NFC card (populated from Card model)
    activeCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
