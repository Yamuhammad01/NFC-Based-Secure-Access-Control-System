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
const userRoutes = require("./routes/userRoutes");
const accessRoutes = require("./routes/accessRoutes");
const readerRoutes = require("./routes/readerRoutes");



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

// Rate limiting (100 requests per 15 min per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// ──────────────────────────────────────────────
//  API Routes
// ──────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/readers", readerRoutes);

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

startServer();

module.exports = app;
