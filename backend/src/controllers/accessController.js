const NfcCardInfo = require("../models/NfcCardInfo");
const Users = require("../models/Users");
const Reader = require("../models/Reader");
const AccessLog = require("../models/AccessLog");
const { ACCESS_RESULT } = require("../config/constants");

/**
 * Access Control Engine - Tap Endpoint
 * Logic: Reader Validation -> Card Validation -> Status Check -> Anti-Passback -> Time Check -> RBAC -> Logging
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

    // 2. Validate Card (NfcCardInfo)
    const card = await NfcCardInfo.findOne({ uid });
    if (!card) {
      return logAndDeny(res, { uid, readerId, door, reader }, "Unknown UID", "Card not found in system");
    }

    // 3. Card Status Check
    if (card.status === "revoked") {
      return logAndDeny(res, { uid, readerId, door, reader, card }, "Card Revoked", "This credential has been permanently revoked");
    }
    if (card.status === "suspended") {
      return logAndDeny(res, { uid, readerId, door, reader, card }, "Card Suspended", "Access temporarily suspended");
    }

    // 4. RBAC (Access Levels)
    const requiredLevel = getRequiredLevel(door);
    if (card.accessLevel < requiredLevel) {
      return logAndDeny(res, { uid, readerId, door, reader, card }, "Insufficient Access Level", `Level ${requiredLevel} required for this area`);
    }

    // 5. Success - Update Card State & Log
    await card.save();

    // Try to find linked user for enriched logging
    let userName = card.name;
    let userRole = card.role;
    let userRef = card.userRef || null;
    if (card.userRef) {
      const user = await Users.findById(card.userRef).select("name role");
      if (user) {
        userName = user.name;
        userRole = user.role;
      }
    }

    await AccessLog.create({
      uid,
      userName,
      role: userRole,
      userRef,
      readerId,
      door,
      direction: reader.direction || "in",
      result: ACCESS_RESULT.GRANTED,
      timestamp: new Date()
    });

    return res.status(200).json({
      status: "granted",
      message: `Welcome, ${userName}. Access granted to ${door}.`,
      user: userName,
      role: userRole
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
  const { uid, readerId, door, card, reader } = context;

  let userName = card ? card.name : "Unknown";
  let userRole = card ? card.role : "Unknown";
  let userRef = card ? card.userRef : null;

  await AccessLog.create({
    uid,
    userName,
    role: userRole,
    userRef,
    readerId,
    door,
    direction: reader ? reader.direction : "in",
    result: ACCESS_RESULT.DENIED,
    reason,
    timestamp: new Date()
  });

  return res.status(403).json({
    status: "denied",
    message,
    user: userName,
    role: userRole
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