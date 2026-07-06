const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const usersSchema = new mongoose.Schema(
  {
    // ===== Identity & Auth =====
    name: {
      type: String,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String, // base64 string or URL
    },
    phone: {
      type: String,
      trim: true,
    },

    // ===== Employment / Academic Info =====
    staffId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },

    // ===== System Role & Status =====
    role: {
      type: String,
      enum: ["admin", "staff", "student"],
      default: "staff",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    // ===== NFC Card Reference =====
    // Currently assigned NFC card UID (one user can have one active card)
    uid: {
      type: String,
      uppercase: true,
      trim: true,
      sparse: true, // allows multiple nulls but unique when set
    },

    // ===== Access Control Fields (mirrored from NfcCardInfo for quick lookup) =====
    accessLevel: {
      type: Number,
      enum: [1, 2, 3],
      default: 1,
    },
    allowedTime: {
      start: { type: String, default: "08:00" },
      end: { type: String, default: "18:00" },
    },
    isInside: {
      type: Boolean,
      default: false,
    },

    // ===== Audit Trail =====
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users", // admin who created this user
      default: null,
    },
  },
  { timestamps: true }
);

// Pre-save hook: generate name from firstName + lastName if name not provided
usersSchema.pre("save", function (next) {
  if (!this.name) {
    this.name = [this.firstName, this.lastName].filter(Boolean).join(" ") || this.email.split("@")[0];
  }
  if (!this.firstName && this.name) {
    const parts = this.name.split(" ");
    this.firstName = parts[0] || "";
    this.lastName = parts.slice(1).join(" ") || "";
  }
  next();
});

module.exports = mongoose.model("Users", usersSchema);