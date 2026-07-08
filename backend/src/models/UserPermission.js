const mongoose = require("mongoose");

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

userPermissionSchema.index({ userRef: 1 }, { unique: true });

module.exports = mongoose.model("UserPermission", userPermissionSchema);