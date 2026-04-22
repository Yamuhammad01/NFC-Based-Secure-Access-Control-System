/**
 * Auth Controller
 * Handles user registration, login, and profile retrieval.
 */

// POST /api/auth/register
exports.register = async (req, res) => {
  // TODO: Validate input, hash password, create user, return JWT
  res.status(501).json({ message: "register – not implemented" });
};

// POST /api/auth/login
exports.login = async (req, res) => {
  // TODO: Validate credentials, compare password, return JWT
  res.status(501).json({ message: "login – not implemented" });
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  // TODO: Return current user from JWT payload
  res.status(501).json({ message: "getMe – not implemented" });
};
