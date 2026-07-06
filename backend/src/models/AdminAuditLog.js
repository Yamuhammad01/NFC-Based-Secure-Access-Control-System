const mongoose = require("mongoose");

const adminAuditLogSchema = new mongoose.Schema(
  {
    adminRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "create_user",
        "update_user",
        "delete_user",
        "create_card",
        "update_card",
        "delete_card",
        "report_lost",
        "report_stolen",
        "replace_card",
        "create_department",
        "update_department",
        "delete_department",
        "login",
        "logout",
        "other",
      ],
    },
    targetType: {
      type: String,
      enum: ["user", "card", "reader", "department", "system"],
      required: true,
    },
    targetId: {
      type: String,
      default: null,
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // Flexible JSON for any extra info
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for fast lookups
adminAuditLogSchema.index({ adminRef: 1, createdAt: -1 });
adminAuditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model("AdminAuditLog", adminAuditLogSchema);