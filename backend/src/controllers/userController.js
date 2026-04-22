/**
 * User Controller
 * Handles CRUD operations for user management (admin dashboard).
 */

// GET /api/users
exports.getAllUsers = async (req, res) => {
  // TODO: Fetch all users with pagination, search, role filter
  res.status(501).json({ message: "getAllUsers – not implemented" });
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  // TODO: Fetch single user with populated card data
  res.status(501).json({ message: "getUserById – not implemented" });
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  // TODO: Update user fields (role, department, isActive)
  res.status(501).json({ message: "updateUser – not implemented" });
};

// DELETE /api/users/:id
exports.deactivateUser = async (req, res) => {
  // TODO: Soft delete – set isActive to false, revoke active card
  res.status(501).json({ message: "deactivateUser – not implemented" });
};
