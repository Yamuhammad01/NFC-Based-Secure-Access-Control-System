/**
 * Auth Middleware
 * Verifies JWT token and attaches user to req.user.
 */

// TODO: Implement JWT verification
const authenticate = (req, res, next) => {
  // Placeholder – will extract token from Authorization header,
  // verify with jwt.verify(), and attach decoded user to req.user
  res.status(501).json({ message: "authenticate middleware – not implemented" });
};

module.exports = authenticate;
