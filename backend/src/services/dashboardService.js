const Users = require("../models/Users");
const NfcCardInfo = require("../models/NfcCardInfo");
const AccessLog = require("../models/AccessLog");
const AdminAuditLog = require("../models/AdminAuditLog");
const Reader = require("../models/Reader");

/**
 * Dashboard Service — returns computed statistics + recent activity.
 * All queries use MongoDB aggregation for production use.
 */

// Helper: start of today (midnight) in local time
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper: 24 hours ago
const twentyFourHoursAgo = () => {
  const d = new Date();
  d.setHours(d.getHours() - 24);
  return d;
};

exports.getStats = async () => {
  try {
    const [
      totalUsers,
      activeCards,
      revokedCards,
      suspendedCards,
      accessLast24h,
      successfulAccess24h,
      failedAccess24h,
      totalReaders,
    ] = await Promise.all([
      Users.countDocuments(),
      NfcCardInfo.countDocuments({ status: "active" }),
      NfcCardInfo.countDocuments({ status: "revoked" }),
      NfcCardInfo.countDocuments({ status: "suspended" }),
      AccessLog.countDocuments({ timestamp: { $gte: twentyFourHoursAgo() } }),
      AccessLog.countDocuments({
        timestamp: { $gte: twentyFourHoursAgo() },
        result: "granted",
      }),
      AccessLog.countDocuments({
        timestamp: { $gte: twentyFourHoursAgo() },
        result: "denied",
      }),
      Reader.countDocuments(),
    ]);

    return {
      totalRegisteredUsers: totalUsers,
      activeNfcCards: activeCards,
      revokedCards: revokedCards,
      suspendedCards: suspendedCards,
      totalAccessAttemptsToday: accessLast24h,
      successfulAccessAttempts: successfulAccess24h,
      failedAccessAttempts: failedAccess24h,
      registeredReaders: totalReaders,
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
};

exports.getRecentActivity = async (limit = 5) => {
  try {
    // Merge AccessLog + AdminAuditLog, sort by timestamp desc, take last N
    const accessActivities = await AccessLog.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    const auditActivities = await AdminAuditLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const merged = [
      ...accessActivities.map((log) => ({
        id: `access-${log._id}`,
        type: "access",
        action: `${log.result === "granted" ? "Access granted" : "Access denied"} — ${log.userName} at ${log.door}`,
        timestamp: log.timestamp,
        details: {
          uid: log.uid,
          readerId: log.readerId,
          door: log.door,
          result: log.result,
          reason: log.reason || null,
        },
      })),
      ...auditActivities.map((audit) => ({
        id: `audit-${audit._id}`,
        type: "admin",
        action: `${audit.action} — ${audit.targetType}`,
        timestamp: audit.createdAt,
        details: {
          adminName: audit.adminName,
          targetType: audit.targetType,
          targetId: audit.targetId,
          action: audit.action,
        },
      })),
    ]

      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    return merged;
  } catch (error) {
    console.error("Dashboard recent activity error:", error);
    throw new Error("Failed to fetch recent activity");
  }
};