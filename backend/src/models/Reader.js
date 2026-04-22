const mongoose = require("mongoose");
const { READER_STATUS, ROLES } = require("../config/constants");

const readerSchema = new mongoose.Schema(
  {
    // Unique device identifier (e.g., "RDR-LAB-001")
    readerId: { type: String, required: true, unique: true, uppercase: true },

    // Human-friendly name
    name: { type: String, required: true },

    // Physical / logical location
    location: { type: String, required: true },
    zone: { type: String, required: true },

    // Direction this reader controls
    direction: {
      type: String,
      enum: ["entry", "exit"],
      default: "entry",
    },

    // Device status
    status: {
      type: String,
      enum: Object.values(READER_STATUS),
      default: READER_STATUS.ONLINE,
    },

    // Which roles are allowed through this reader
    allowedRoles: {
      type: [String],
      enum: Object.values(ROLES),
      default: [ROLES.ADMIN],
    },

    // Time-based access window (e.g., lab: 08:00 – 18:00)
    accessSchedule: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String, default: "00:00" }, // HH:mm
      endTime: { type: String, default: "23:59" },   // HH:mm
      daysOfWeek: {
        type: [Number], // 0 = Sun, 1 = Mon, ..., 6 = Sat
        default: [1, 2, 3, 4, 5], // Mon–Fri
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reader", readerSchema);
