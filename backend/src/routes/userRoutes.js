const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticate = require("../middlewares/auth");

// All user management routes require admin/staff authentication
router.use(authenticate);

// GET    /api/users          — List all users (admin)
router.get("/", userController.getAllUsers);

// POST   /api/users          — Register new user/cardholder
router.post("/", userController.createUser);

// GET    /api/users/:id      — Get single user details
router.get("/:id", userController.getUserById);

// PUT    /api/users/:id      — Update user details
router.put("/:id", userController.updateUser);

// PUT    /api/users/:id/lost — Mark card as lost (status: revoked)
router.put("/:id/lost", userController.reportLostCard);

// PUT    /api/users/:id/stolen — Mark card as stolen (status: suspended)
router.put("/:id/stolen", userController.reportStolenCard);

// PUT    /api/users/:id/replace — Assign new card UID and set active
router.put("/:id/replace", userController.replaceCard);

// DELETE /api/users/:id      — Deactivate/Suspend account
router.delete("/:id", userController.deactivateUser);

module.exports = router;
