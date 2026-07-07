const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { createUserValidator, updateUserValidator } = require("../validators/userValidator");
const authenticate = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");

// All user management routes require authentication and admin privileges
router.use(authenticate);
router.use(authorize("admin"));

// GET    /api/users     - List users (with search and filters)
router.get("/", userController.getAllUsers);

// GET    /api/users/:id - Get details of a single user
router.get("/:id", userController.getUserById);

// POST   /api/users     - Register/Create a user
router.post("/", createUserValidator, userController.registerUser);

// PUT    /api/users/:id - Update user details
router.put("/:id", updateUserValidator, userController.updateUser);

// DELETE /api/users/:id - Soft delete user
router.delete("/:id", userController.deleteUser);

module.exports = router;
