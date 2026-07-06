/**
 * Application-wide constants
 */

// User roles (Users model - for auth accounts: staff, students, admins)
const ROLES = Object.freeze({
  STUDENT: "student",
  STAFF: "staff",
  ADMIN: "admin",
});

// Card/NfcCardInfo lifecycle statuses
const STATUS = Object.freeze({
  ACTIVE: "active",
  REVOKED: "revoked",
  SUSPENDED: "suspended",
});

// Access log result types
const ACCESS_RESULT = Object.freeze({
  GRANTED: "granted",
  DENIED: "denied",
});

// Reader statuses
const READER_STATUS = Object.freeze({
  ONLINE: "online",
  OFFLINE: "offline",
});

module.exports = {
  ROLES,
  STATUS,
  ACCESS_RESULT,
  READER_STATUS,
};