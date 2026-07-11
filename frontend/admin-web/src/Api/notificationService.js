import api from "./apiClient";

/**
 * GET /api/notifications
 * Returns notifications for the authenticated user.
 * @param {object} params - { filter?: string, limit?: number }
 */
export const getNotifications = async (params = {}) => {
  try {
    const response = await api.get("/notifications", { params });
    return response.data; // { notifications: [...], unreadCount: number }
  } catch (error) {
    console.warn("Failed to fetch notifications from backend.", error.message);
    throw error;
  }
};

/**
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = async () => {
  try {
    const response = await api.get("/notifications/unread-count");
    return response.data; // { unreadCount: number }
  } catch (error) {
    console.warn("Failed to fetch unread count.", error.message);
    throw error;
  }
};

/**
 * PATCH /api/notifications/:id/dismiss
 * Dismiss a single notification
 */
export const dismissNotification = async (id) => {
  try {
    const response = await api.patch(`/notifications/${id}/dismiss`);
    return response.data;
  } catch (error) {
    console.warn(`Failed to dismiss notification ${id}.`, error.message);
    throw error;
  }
};

/**
 * POST /api/notifications/dismiss-all
 * Dismiss all notifications for the current user
 */
export const dismissAllNotifications = async () => {
  try {
    const response = await api.post("/notifications/dismiss-all");
    return response.data;
  } catch (error) {
    console.warn("Failed to dismiss all notifications.", error.message);
    throw error;
  }
};