/**
 * Access Controller
 * Core NFC tap simulation + access log queries.
 */

// POST /api/access/tap
exports.handleTap = async (req, res) => {
  // TODO: Full access control pipeline:
  //   1. Validate reader (readerId exists, is online)
  //   2. Look up card by UID
  //   3. Check card status (must be active)
  //   4. Check user role against reader's allowedRoles
  //   5. Check time-based access schedule
  //   6. Anti-passback check (last direction for this user at this zone)
  //   7. Log result (granted / denied + reason)
  //   8. Return response
  res.status(501).json({ message: "handleTap – not implemented" });
};

// GET /api/access/logs
exports.getLogs = async (req, res) => {
  // TODO: Paginated, filterable access logs for admin dashboard
  res.status(501).json({ message: "getLogs – not implemented" });
};

// GET /api/access/logs/user/:userId
exports.getLogsByUser = async (req, res) => {
  // TODO: Access logs filtered by specific user
  res.status(501).json({ message: "getLogsByUser – not implemented" });
};
