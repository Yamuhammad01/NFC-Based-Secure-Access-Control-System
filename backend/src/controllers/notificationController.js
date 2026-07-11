const notificationService = require("../services/notificationService");
const Users = require("../models/Users");

/**
 * GET /api/notifications
 * Returns notifications for the authenticated user, scoped by their UID.
 * Query params:
 *   - filter: "all" | "unread" | "danger" | "warning" | "activity" (default: "all")
 *   - limit: number (default: 100)
 */
exports.getNotifications = async (req, res) => {
  try {
    const user = await Users.findById(req.user.userId).select("uid");
    if (!user || !user.uid) {
      return res.status(200).json({ notifications: [], unreadCount: 0 });
    }

    const { filter, limit } = req.query;

    const notifications = await notificationService.getNotifications(user.uid, {
      filter: filter || "all",
      includeDismissed: true,
      limit: parseInt(limit) || 100,
    });

    // Filter out dismissed notifications for the unread count
    const activeNotifications = notifications.filter((n) => !n.dismissed);

    res.json({
      notifications,
      unreadCount: activeNotifications.length,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/**
 * GET /api/notifications/unread-count
 * Returns just the unread count for the badge
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const user = await Users.findById(req.user.userId).select("uid");
    if (!user || !user.uid) {
      return res.json({ unreadCount: 0 });
    }

    const unreadCount = await notificationService.getUnreadCount(user.uid);
    res.json({ unreadCount });
  } catch (error) {
    console.error("Unread count error:", error);
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
};

/**
 * PATCH /api/notifications/:id/dismiss
 * Dismiss a single notification
 */
exports.dismissNotification = async (req, res) => {
  try {
    const user = await Users.findById(req.user.userId).select("uid");
    if (!user || !user.uid) {
      return res.status(404).json({ message: "User not found or no card assigned" });
    }

    const notification = await notificationService.dismissNotification(
      req.params.id,
      user.uid
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification dismissed" });
  } catch (error) {
    console.error("Dismiss notification error:", error);
    res.status(500).json({ message: "Failed to dismiss notification" });
  }
};

/**
 * POST /api/notifications/dismiss-all
 * Dismiss all notifications for the current user
 */
exports.dismissAll = async (req, res) => {
  try {
    const user = await Users.findById(req.user.userId).select("uid");
    if (!user || !user.uid) {
      return res.status(404).json({ message: "User not found or no card assigned" });
    }

    await notificationService.dismissAll(user.uid);
    res.json({ message: "All notifications dismissed" });
  } catch (error) {
    console.error("Dismiss all error:", error);
    res.status(500).json({ message: "Failed to dismiss notifications" });
  }
};