const mongoose = require("mongoose");

const readerSchema = new mongoose.Schema(
  {
    // Unique device identifier
    readerId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reader", readerSchema);
