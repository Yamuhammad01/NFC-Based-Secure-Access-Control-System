/**
 * Application-wide constants
 */

// User / Card roles
const ROLES = Object.freeze({
  ADMIN: "admin",
  SECURITY: "security",
  STUDENT: "student",
  STAFF: "staff",
  VISITOR: "visitor",
});

// Card lifecycle statuses
const CARD_STATUS = Object.freeze({
  ACTIVE: "active",
  LOST: "lost",
  STOLEN: "stolen",
  REVOKED: "revoked",
  REPLACED: "replaced",
  EXPIRED: "expired",
});

// Access log result types
const ACCESS_RESULT = Object.freeze({
  GRANTED: "granted",
  DENIED: "denied",
});

// Denial reasons
const DENIAL_REASON = Object.freeze({
  INVALID_CARD: "invalid_card",
  CARD_INACTIVE: "card_inactive",
  UNAUTHORIZED_ZONE: "unauthorized_zone",
  OUTSIDE_TIME_WINDOW: "outside_time_window",
  ANTI_PASSBACK: "anti_passback_violation",
  INVALID_READER: "invalid_reader",
  READER_OFFLINE: "reader_offline",
});

// Reader statuses
const READER_STATUS = Object.freeze({
  ONLINE: "online",
  OFFLINE: "offline",
  MAINTENANCE: "maintenance",
});

module.exports = {
  ROLES,
  CARD_STATUS,
  ACCESS_RESULT,
  DENIAL_REASON,
  READER_STATUS,
};
