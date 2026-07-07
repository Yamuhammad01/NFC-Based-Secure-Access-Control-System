const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticate = require("../middlewares/auth");

// POST /api/auth/register   — Register a new user
router.post("/register", authController.register);

// POST /api/auth/login      — Login and receive JWT
router.post("/login", authController.login);

// POST /api/auth/change-password — Change password (authenticated)
router.post("/change-password", authenticate, authController.changePassword);

// POST /api/auth/forgot-password — Request password reset
router.post("/forgot-password", authController.forgotPassword);

// POST /api/auth/reset-password  — Complete password reset with token
router.post("/reset-password", authController.resetPassword);

// GET  /api/auth/me          — Get current user profile (protected)
router.get("/me", authenticate, authController.getMe);

module.exports = router;