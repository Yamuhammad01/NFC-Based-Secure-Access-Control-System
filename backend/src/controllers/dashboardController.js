const dashboardService = require("../services/dashboardService");

/**
 * GET /api/dashboard/stats
 * Returns aggregated dashboard statistics
 */
exports.getStats = async (req, res) => {
  try {
    const stats = await dashboardService.getStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error("Controller stats error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard statistics", error: error.message });
  }
};

/**
 * GET /api/dashboard/recent-activity
 * Returns last N merged access logs + admin audit logs
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const activity = await dashboardService.getRecentActivity(limit);
    res.status(200).json(activity);
  } catch (error) {
    console.error("Controller recent activity error:", error);
    res.status(500).json({ message: "Failed to fetch recent activity", error: error.message });
  }
};