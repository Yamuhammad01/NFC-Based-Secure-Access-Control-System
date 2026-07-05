const User = require("../models/User");
const Reader = require("../models/Reader");
const AccessLog = require("../models/AccessLog");
const { ACCESS_RESULT } = require("../config/constants");

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

    // 2. Find user by UID
    const user = await User.findOne({ uid: value });
    if (!user) {
      return res.status(403).json({
        status: "denied",
        message: "Unknown credential. User not found.",
        value
      });
    }

    // 3. Card Status Check
    if (user.status === "revoked") {
      return res.status(403).json({
        status: "denied",
        message: "This credential has been permanently revoked.",
        user: user.name,
        role: user.role
      });
    }
    if (user.status === "suspended") {
      return res.status(403).json({
        status: "denied",
        message: "Access temporarily suspended.",
        user: user.name,
        role: user.role
      });
    }

    // 4. RBAC - Check access level for the door
    const requiredLevel = getRequiredLevel(door);
    if (user.accessLevel < requiredLevel) {
      await AccessLog.create({
        uid: value,
        userName: user.name,
        role: user.role,
        door: door || "unknown",
        result: ACCESS_RESULT.DENIED,
        reason: "Insufficient Access Level",
        timestamp: new Date()
      });

      return res.status(403).json({
        status: "denied",
        message: `Insufficient access level. Level ${requiredLevel} required for this area.`,
        user: user.name,
        role: user.role
      });
    }

    // 5. Success
    await AccessLog.create({
      uid: value,
      userName: user.name,
      role: user.role,
      door: door || "unknown",
      result: ACCESS_RESULT.GRANTED,
      timestamp: new Date()
    });

    return res.status(200).json({
      status: "granted",
      message: `Welcome, ${user.name}. Access granted.`,
      user: user.name,
      role: user.role,
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

/**
 * Helper: Map doors to access levels
 */
function getRequiredLevel(door) {
  const mapping = {
    main_gate: 1,
    lab: 1,
    staff_office: 2,
    server_room: 3,
  };
  if (!door) return 1;
  const normalized = door.toLowerCase().replace(/\s+/g, '_');
  return mapping[normalized] || 1;
}