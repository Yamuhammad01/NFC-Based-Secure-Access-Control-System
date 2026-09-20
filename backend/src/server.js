require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const { getUploadsRoot } = require("./utils/upload");


let dbConnectPromise = null;
const ensureDB = () => {
  if (!dbConnectPromise) {
    dbConnectPromise = connectDB().catch((err) => {
      dbConnectPromise = null; // clear so the next request can retry
      throw err;
    });
  }
  return dbConnectPromise;
};

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const nfcCardInfoRoutes = require("./routes/nfcCardInfoRoutes");
const accessRoutes = require("./routes/accessRoutes");
const readerRoutes = require("./routes/readerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const profileRoutes = require("./routes/profileRoutes");
const scanRoutes = require("./routes/scanRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const temporaryAccessRoutes = require("./routes/temporaryAccessRoutes");
const notificationRoutes = require("./routes/notificationRoutes");


const app = express();


// Trusting the single proxy hop lets req.ip resolve to the real client IP.
app.set("trust proxy", process.env.VERCEL ? 1 : false);

// ──────────────────────────────────────────────
//  Global Middleware
// ──────────────────────────────────────────────
app.use(helmet()); // Security headers
//app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cors()); // Allow all origins for testing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // HTTP request logging

// Rate limiting (much higher in local development to avoid blocking debug tools)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// Serve uploaded files statically (resolves to /tmp/uploads on Vercel, backend/uploads locally)
app.use("/uploads", express.static(getUploadsRoot()));

// ──────────────────────────────────────────────
//  Ensure MongoDB is connected before handling ANY request.
//  If the DB is unavailable, respond with 503 Service Unavailable.
// ──────────────────────────────────────────────
app.use(async (req, res, next) => {
  try {
    await ensureDB();
    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB connection is not ready");
    }
    next();
  } catch (err) {
    console.error("DB unavailable for request:", err.message);
    res.status(503).json({
      message:
        "Service temporarily unavailable: could not reach the database. Please try again shortly.",
    });
  }
});

// ──────────────────────────────────────────────
//  API Routes
// ──────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cards", nfcCardInfoRoutes);      // NFC Card management (replaces /api/users)
app.use("/api/access", accessRoutes);
app.use("/api/readers", readerRoutes);
app.use(["/api/Admin", "/api/api/Admin"], adminRoutes);
app.use("/api", profileRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/temp-access", temporaryAccessRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ──────────────────────────────────────────────
//  Error Handling
// ──────────────────────────────────────────────
app.use(errorHandler);

// ──────────────────────────────────────────────
//  Start Server
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
};

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer();
} else {
  // Kick off the connection at cold start (memoized + awaited per-request via ensureDB).
  ensureDB().catch((err) => console.error("Initial DB connect failed:", err.message));
}

module.exports = app;