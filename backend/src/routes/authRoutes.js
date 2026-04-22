const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// POST /api/auth/register   — Register a new user
router.post("/register", authController.register);

// POST /api/auth/login      — Login and receive JWT
router.post("/login", authController.login);

// GET  /api/auth/me          — Get current user profile (protected)
router.get("/me", authController.getMe);

module.exports = router;
