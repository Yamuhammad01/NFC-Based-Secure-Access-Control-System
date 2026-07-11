const Notification = require("../models/Notification");
const Users = require("../models/Users");

/**
 * Notification Service
 * Handles creation and retrieval of notifications scoped to a user's UID.
 */

/**
 * Create a notification for a given user UID
 */
exports.createNotification = async ({
  uid,
  type,
  severity,
  title,
  message,
  location = null,
  readerId = null,
  eventTimestamp = new Date(),
}) => {
  // Look up the user to get userRef
  const user = await Users.findOne({ uid: uid.toUpperCase() });
  const notification = new Notification({
    uid: uid.toUpperCase(),
    userRef: user ? user._id : null,
    type,
    severity,
    title,
    message,
    location,
    readerId: readerId ? readerId.toUpperCase() : null,
    eventTimestamp,
  });
  return notification.save();
};

/**
 * Get notifications for the authenticated user (filtered by their UID)
 * @param {string} uid - The user's card UID
 * @param {object} options
 * @param {string} [options.filter] - "all" | "unread" | "danger" | "warning" | "activity"
 * @param {boolean} [options.includeDismissed] - Whether to include dismissed notifications (default false)
 * @param {number} [options.limit] - Max number of notifications (default 100)
 */
exports.getNotifications = async (uid, options = {}) => {
  const { filter = "all", includeDismissed = true, limit = 100 } = options;

  const query = { uid: uid.toUpperCase() };

  // By default, exclude dismissed unless explicitly included
  if (!includeDismissed) {
    query.dismissed = false;
  }

  // Apply filter
  if (filter === "danger") {
    query.severity = "danger";
  } else if (filter === "warning") {
    query.severity = "warning";
  } else if (filter === "activity") {
    query.severity = "info";
  }

  const notifications = await Notification.find(query)
    .sort({ eventTimestamp: -1 })
    .limit(limit)
    .lean();

  return notifications.map((n) => ({
    id: n._id.toString(),
    type: n.type,
    severity: n.severity,
    title: n.title,
    message: n.message,
    timestamp: n.eventTimestamp,
    location: n.location,
    readerId: n.readerId,
    dismissed: n.dismissed,
  }));
};

/**
 * Mark a specific notification as read (dismissed=false — frontend tracks read separately)
 * The frontend uses localStorage for read state, but we support marking as dismissed here.
 */
exports.markAsDismissed = async (notificationId, uid) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, uid: uid.toUpperCase() },
    { dismissed: true },
    { new: true }
  );
  return notification;
};

/**
 * Dismiss a notification (remove from the user's view permanently)
 */
exports.dismissNotification = async (notificationId, uid) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, uid: uid.toUpperCase() },
    { dismissed: true },
    { new: true }
  );
  return notification;
};

/**
 * Mark all notifications as dismissed for a user
 */
exports.dismissAll = async (uid) => {
  await Notification.updateMany(
    { uid: uid.toUpperCase(), dismissed: false },
    { dismissed: true }
  );
  return true;
};

/**
 * Get unread count (not dismissed) for a user
 */
exports.getUnreadCount = async (uid) => {
  return Notification.countDocuments({
    uid: uid.toUpperCase(),
    dismissed: false,
  });
};