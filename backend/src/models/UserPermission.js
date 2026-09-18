const mongoose = require("mongoose");

const tempAreaSchema = new mongoose.Schema(
  {
    areaId: { type: String, required: true },
    grantedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const userPermissionSchema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      unique: true,
    },
    allowedAreas: [
      {
        type: String,
      },
    ],
    revokedAreas: [
      {
        type: String,
      },
    ],
    tempAreas: [tempAreaSchema],
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("UserPermission", userPermissionSchema);