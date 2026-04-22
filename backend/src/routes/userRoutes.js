const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// GET    /api/users          — List all users (admin)
router.get("/", userController.getAllUsers);

// GET    /api/users/:id      — Get single user
router.get("/:id", userController.getUserById);

// PUT    /api/users/:id      — Update user
router.put("/:id", userController.updateUser);

// DELETE /api/users/:id      — Deactivate user (soft delete)
router.delete("/:id", userController.deactivateUser);

module.exports = router;
