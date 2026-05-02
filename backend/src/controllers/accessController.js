const User = require("../models/User");
const Reader = require("../models/Reader");
const AccessLog = require("../models/AccessLog");
const { ACCESS_RESULT } = require("../config/constants");

/**
 * Access Control Engine - Tap Endpoint
 * Logic: Reader Validation -> User Validation -> Status Check -> Anti-Passback -> Time Check -> RBAC -> Logging
 */
exports.tap = async (req, res) => {
  const { uid, readerId, door } = req.body;

  console.log(req.body)
  try {
    // 1. Validate Reader
    const reader = await Reader.findOne({ readerId });
    if (!reader) {
      return logAndDeny(res, { uid, readerId, door }, "Invalid Reader", "Reader not found in system");
    }
    if (!reader.isActive) {
      return logAndDeny(res, { uid, readerId, door, reader }, "Reader Offline", "The access point is currently disabled");
    }

    // 2. Validate User/UID
    const user = await User.findOne({ uid });
    if (!user) {
      return logAndDeny(res, { uid, readerId, door, reader }, "Unknown UID", "User not found");
    }

    // 3. Card Status Check
    if (user.status === "revoked") {
      return logAndDeny(res, { uid, readerId, door, reader, user }, "Card Revoked", "This credential has been permanently revoked");
    }
    if (user.status === "suspended") {
      return logAndDeny(res, { uid, readerId, door, reader, user }, "User Suspended", "Access temporarily suspended");
    }

    // 4. Anti-Passback Logic
    // Only enforced for 'in' direction. If already inside, can't enter again.
    if (reader.direction === "in" && user.isInside) {
      return logAndDeny(res, { uid, readerId, door, reader, user }, "Anti-Passback Violation", "User is already registered as 'Inside'");
    }
    // Only 'in' readers can set isInside to true, 'out' readers set it to false.
    const newInsideStatus = reader.direction === "in" ? true : false;

    // 5. Time-Based Access
    if (!isWithinAllowedTime(user.allowedTime)) {
      return logAndDeny(res, { uid, readerId, door, reader, user }, "Outside Allowed Hours", `Access only permitted between ${user.allowedTime.start} and ${user.allowedTime.end}`);
    }

    // 6. RBAC (Access Levels)
    const requiredLevel = getRequiredLevel(door);
    if (user.accessLevel < requiredLevel) {
      return logAndDeny(res, { uid, readerId, door, reader, user }, "Insufficient Access Level", `Level ${requiredLevel} required for this area`);
    }

    // 7. Success - Update User State & Log
    user.isInside = newInsideStatus;
    await user.save();

    await AccessLog.create({
      uid,
      userName: user.name,
      role: user.role,
      readerId,
      door,
      result: ACCESS_RESULT.GRANTED,
      timestamp: new Date()
    });

    return res.status(200).json({
      status: "granted",
      message: `Welcome, ${user.name}. Access granted to ${door}.`,
      user: user.name,
      role: user.role
    });

  } catch (error) {
    console.error("Access Engine Error:", error);
    res.status(500).json({ status: "error", message: "Internal server error during access processing" });
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
  // Normalize door string (lowercase, replace spaces)
  const normalized = door.toLowerCase().replace(/\s+/g, '_');
  return mapping[normalized] || 1; // Default to level 1 if unknown
}

/**
 * Helper: Time validation (HH:mm format)
 */
function isWithinAllowedTime(allowedTime) {
  const now = new Date();
  const currentStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return currentStr >= allowedTime.start && currentStr <= allowedTime.end;
}

/**
 * Helper: Log denial and return response
 */
async function logAndDeny(res, context, reason, message) {
  const { uid, readerId, door, user } = context;

  await AccessLog.create({
    uid,
    userName: user ? user.name : "Unknown",
    role: user ? user.role : "Unknown",
    readerId,
    door,
    result: ACCESS_RESULT.DENIED,
    reason,
    timestamp: new Date()
  });

  return res.status(403).json({
    status: "denied",
    message,
    user: user ? user.name : "Unknown",
    role: user ? user.role : "Unknown"
  });
}

/**
 * GET /api/access/logs
 */
exports.getLogs = async (req, res) => {
  try {
    const logs = await AccessLog.find().sort({ timestamp: -1 }).limit(100);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};

/**
 * GET /api/access/logs/user/:uid
 */
exports.getLogsByUser = async (req, res) => {
  try {
    const logs = await AccessLog.find({ uid: req.params.uid }).sort({ timestamp: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user logs" });
  }
};
