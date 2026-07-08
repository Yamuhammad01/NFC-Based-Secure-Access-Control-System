const mongoose = require("mongoose");

const rolePermissionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["admin", "staff", "student"],
      required: true,
      unique: true,
    },
    allowedAreas: [
      {
        type: String,
        required: true,
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

rolePermissionSchema.index({ role: 1 }, { unique: true });

module.exports = mongoose.model("RolePermission", rolePermissionSchema);