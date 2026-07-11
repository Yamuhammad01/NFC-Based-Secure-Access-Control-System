const NfcCardInfo = require("../models/NfcCardInfo");
const Users = require("../models/Users");
const AccessLog = require("../models/AccessLog");
const RolePermission = require("../models/RolePermission");
const UserPermission = require("../models/UserPermission");
const { ACCESS_RESULT, ROLES } = require("../config/constants");
const notificationService = require("../services/notificationService");

/**
 * Helper: Get effective permissions for a user (same logic as permissionController)
 * Combines role defaults + user overrides + temp areas - revoked areas
 */
async function getEffectivePermissions(userRole, userId) {
  if (userRole === "admin") {
    return []; // Admin has access to all areas (empty = all)
  }

  // Get role defaults
  const rolePerm = await RolePermission.findOne({ role: userRole });
  const ACCESS_AREAS_DEFAULTS = require("../config/roleDefaults");
  let baseAllowed = rolePerm ? [...rolePerm.allowedAreas] : [...(ACCESS_AREAS_DEFAULTS[userRole] || [])];

  // Get user overrides
  const userPerm = await UserPermission.findOne({ userRef: userId });
  let extraAllowed = userPerm ? [...userPerm.allowedAreas] : [];
  let revoked = userPerm ? [...userPerm.revokedAreas] : [];

  // Get temp areas (time-based), filtering out expired ones
  const now = new Date();
  const tempAreas = userPerm ? userPerm.tempAreas.filter((t) => t.expiresAt > now).map((t) => t.areaId) : [];

  // Remove expired temp areas from the database
  if (userPerm && userPerm.tempAreas && userPerm.tempAreas.length > 0) {
    const expiredCount = userPerm.tempAreas.filter((t) => t.expiresAt <= now).length;
    if (expiredCount > 0) {
      userPerm.tempAreas = userPerm.tempAreas.filter((t) => t.expiresAt > now);
      await userPerm.save();
    }
  }

  // Combine: base + extra + temp - revoked
  const effective = [...new Set([...baseAllowed, ...extraAllowed, ...tempAreas])].filter(
    (area) => !revoked.includes(area)
  );

  return effective;
}

/**
 * POST /api/scan
 * Accepts { value, door } where value is the QR code content (UID)
 * This is the simplified scan endpoint used by the scanner-web frontend
 */
exports.scan = async (req, res) => {
  const { value, door } = req.body;

  console.log("[SCAN] Received:", { value, door });

  try {
    // 1. Validate UID
    if (!value) {
      return res.status(400).json({
        status: "denied",
        message: "No QR data provided"
      });
    }

    // 2. Find card by UID
    const card = await NfcCardInfo.findOne({ uid: value });
    if (!card) {
      return res.status(403).json({
        status: "denied",
        message: "Unknown credential. Card not found.",
        value
      });
    }

    // 3. Card Status Check
    if (card.status === "revoked") {
      return res.status(403).json({
        status: "denied",
        message: "This credential has been permanently revoked.",
        user: card.name,
        role: card.role
      });
    }
    if (card.status === "suspended") {
      return res.status(403).json({
        status: "denied",
        message: "Access temporarily suspended.",
        user: card.name,
        role: card.role
      });
    }

    // 4. RBAC - Check effective permissions (role defaults + user overrides + temp areas)
    const effectivePermissions = await getEffectivePermissions(card.role, card.userRef);

    // If effectivePermissions is empty array, user has access to all areas (admin)
    const hasPermission = effectivePermissions.length === 0 || effectivePermissions.includes(door);

    if (!hasPermission) {
      await AccessLog.create({
        uid: value,
        userName: card.name,
        role: card.role,
        userRef: card.userRef,
        readerId: "QR_SCANNER",
        door: door || "unknown",
        result: ACCESS_RESULT.DENIED,
        reason: "Insufficient Permissions",
        timestamp: new Date()
      });

      // Create notification for denied access
      try {
        await notificationService.createNotification({
          uid: value,
          type: "unauthorized",
          severity: "danger",
          title: "Unauthorized Access Attempt Detected",
          message: `An access attempt was made at ${door || "unknown area"} using your card but was denied due to insufficient permissions.`,
          location: door || "unknown",
          readerId: "QR_SCANNER",
          eventTimestamp: new Date(),
        });
      } catch (notifErr) {
        console.error("Failed to create notification:", notifErr.message);
      }

      return res.status(403).json({
        status: "denied",
        message: `Access denied. Your role (${card.role}) does not have permission for this area.`,
        user: card.name,
        role: card.role
      });
    }

    // 5. Success
    await AccessLog.create({
      uid: value,
      userName: card.name,
      role: card.role,
      userRef: card.userRef,
      readerId: "QR_SCANNER",
      door: door || "unknown",
      result: ACCESS_RESULT.GRANTED,
      timestamp: new Date()
    });

    // Create notification for granted access
    try {
      await notificationService.createNotification({
        uid: value,
        type: "card_used",
        severity: "info",
        title: `Card Used at ${door || "unknown area"}`,
        message: `Your NFC card was successfully scanned at ${door || "unknown area"} via QR scanner. Access granted.`,
        location: door || "unknown",
        readerId: "QR_SCANNER",
        eventTimestamp: new Date(),
      });
    } catch (notifErr) {
      console.error("Failed to create notification:", notifErr.message);
    }

    return res.status(200).json({
      status: "granted",
      message: `Welcome, ${card.name}. Access granted.`,
      user: card.name,
      role: card.role,
      value
    });

  } catch (error) {
    console.error("[SCAN] Error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error during scan processing"
    });
  }
};