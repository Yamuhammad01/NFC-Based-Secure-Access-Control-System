const NfcCardInfo = require("../models/NfcCardInfo");
const Users = require("../models/Users");
const AccessLog = require("../models/AccessLog");
const RolePermission = require("../models/RolePermission");
const { ACCESS_RESULT, ROLES } = require("../config/constants");

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

    // 4. RBAC - Check role-based permission for the door
    const rolePermission = await RolePermission.findOne({ role: card.role });
    
    // Handle special case: if allowedAreas is empty, grant access by default (e.g., admin role)
    const hasPermission = rolePermission && (
      rolePermission.allowedAreas.length === 0 || 
      rolePermission.allowedAreas.includes(door)
    );
    
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

