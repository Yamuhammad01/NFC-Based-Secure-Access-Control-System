const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");
const notificationController = require("../controllers/notificationController");

/**
 * GET /api/notifications
 * Returns notifications for the authenticated user (scoped by their UID).
 * Query params: filter, limit
 */
router.get("/", authenticate, notificationController.getNotifications);

/**
 * GET /api/notifications/unread-count
 * Returns just the unread count
 */
router.get("/unread-count", authenticate, notificationController.getUnreadCount);

/**
 * PATCH /api/notifications/:id/dismiss
 * Dismiss a single notification
 */
router.patch("/:id/dismiss", authenticate, notificationController.dismissNotification);

/**
 * POST /api/notifications/dismiss-all
 * Dismiss all notifications for the current user
 */
router.post("/dismiss-all", authenticate, notificationController.dismissAll);

module.exports = router;