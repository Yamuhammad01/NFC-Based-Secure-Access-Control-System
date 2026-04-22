const express = require("express");
const router = express.Router();
const accessController = require("../controllers/accessController");

// POST  /api/access/tap       — Simulate an NFC tap (core endpoint)
router.post("/tap", accessController.handleTap);

// GET   /api/access/logs      — Query access logs (admin dashboard)
router.get("/logs", accessController.getLogs);

// GET   /api/access/logs/user/:userId — Logs for a specific user
router.get("/logs/user/:userId", accessController.getLogsByUser);

module.exports = router;
