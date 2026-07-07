require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");

// Route imports
const authRoutes = require("./routes/authRoutes");
const nfcCardInfoRoutes = require("./routes/nfcCardInfoRoutes");
const accessRoutes = require("./routes/accessRoutes");
const readerRoutes = require("./routes/readerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const profileRoutes = require("./routes/profileRoutes");
const scanRoutes = require("./routes/scanRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");


const app = express();

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

// ──────────────────────────────────────────────
//  API Routes
// ──────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/cards", nfcCardInfoRoutes);      // NFC Card management (replaces /api/users)
app.use("/api/access", accessRoutes);
app.use("/api/readers", readerRoutes);
app.use(["/api/Admin", "/api/api/Admin"], adminRoutes);
app.use("/api", profileRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/dashboard", dashboardRoutes);

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
  // connect to the DB on vercel 
  connectDB();
}

module.exports = app;