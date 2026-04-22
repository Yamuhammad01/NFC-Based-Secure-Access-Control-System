/**
 * RBAC Middleware
 * Restricts route access to specific roles.
 *
 * Usage: authorize("admin", "security")
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // TODO: Check req.user.role against allowedRoles
    // If not authorized, return 403
    res
      .status(501)
      .json({ message: "authorize middleware – not implemented" });
  };
};

module.exports = authorize;
