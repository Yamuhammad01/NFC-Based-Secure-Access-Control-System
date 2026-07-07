const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");
const dashboardController = require("../controllers/dashboardController");

/**
 * GET /api/dashboard/stats
 * Returns aggregated dashboard statistics
 */
router.get("/stats", authenticate, dashboardController.getStats);

/**
 * GET /api/dashboard/recent-activity
 * Returns last N merged access logs + admin audit logs
 * Query param: ?limit=5
 */
router.get("/recent-activity", authenticate, dashboardController.getRecentActivity);

module.exports = router;