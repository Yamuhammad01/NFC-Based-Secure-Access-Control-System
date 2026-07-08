const RolePermission = require("../models/RolePermission");
const UserPermission = require("../models/UserPermission");
const Users = require("../models/Users");
const AdminAuditLog = require("../models/AdminAuditLog");
const ACCESS_AREAS_DEFAULTS = require("../config/roleDefaults");

// Helper: get effective permissions for a user
async function getEffectivePermissions(userRole, userId) {
  if (userRole === "admin") {
    return []; // Admin has access to all areas (empty = all)
  }

  // Get role defaults
  const rolePerm = await RolePermission.findOne({ role: userRole });
  let baseAllowed = rolePerm ? [...rolePerm.allowedAreas] : [...(ACCESS_AREAS_DEFAULTS[userRole] || [])];

  // Get user overrides
  const userPerm = await UserPermission.findOne({ userRef: userId });
  let extraAllowed = userPerm ? [...userPerm.allowedAreas] : [];
  let revoked = userPerm ? [...userPerm.revokedAreas] : [];

  // Combine: base + extra - revoked
  const effective = [...new Set([...baseAllowed, ...extraAllowed])].filter(
    (area) => !revoked.includes(area)
  );

  return effective;
}

// GET /api/permissions/role/:role — Get role default permissions
exports.getRolePermissions = async (req, res) => {
  try {
    const { role } = req.params;

    if (!["admin", "staff", "student"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const rolePerm = await RolePermission.findOne({ role });
    const allowedAreas = rolePerm ? rolePerm.allowedAreas : [...(ACCESS_AREAS_DEFAULTS[role] || [])];

    res.status(200).json({
      role,
      allowedAreas,
      updatedAt: rolePerm?.updatedAt || null,
      updatedBy: rolePerm?.updatedBy || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching role permissions", error: error.message });
  }
};

// PUT /api/permissions/role/:role — Admin updates role default permissions
exports.updateRolePermissions = async (req, res) => {
  try {
    const { role } = req.params;
    const { allowedAreas } = req.body;

    if (!["admin", "staff", "student"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!Array.isArray(allowedAreas)) {
      return res.status(400).json({ message: "allowedAreas must be an array" });
    }

    const rolePerm = await RolePermission.findOneAndUpdate(
      { role },
      {
        allowedAreas,
        updatedBy: req.user?.userId || null,
        updatedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    // Log admin audit
    if (req.user) {
      await AdminAuditLog.create({
        adminRef: req.user.userId,
        adminName: req.user.email,
        action: "update_role_permissions",
        targetType: "role_permission",
        targetId: role,
        details: { role, allowedAreasCount: allowedAreas.length },
      });
    }

    res.status(200).json({
      message: "Role permissions updated successfully",
      rolePerm,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating role permissions", error: error.message });
  }
};

// GET /api/permissions/user/:userId — Get user's effective permissions
exports.getUserPermissions = async (req, res) => {
  try {
    const user = await Users.findById(req.params.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const effectivePermissions = await getEffectivePermissions(user.role, user._id);

    res.status(200).json({
      userId: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
      effectivePermissions,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user permissions", error: error.message });
  }
};

// PUT /api/permissions/user/:userId — Admin sets user-specific overrides
exports.updateUserPermissions = async (req, res) => {
  try {
    const user = await Users.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { allowedAreas, revokedAreas } = req.body;

    if (!Array.isArray(allowedAreas) || !Array.isArray(revokedAreas)) {
      return res.status(400).json({ message: "allowedAreas and revokedAreas must be arrays" });
    }

    const userPerm = await UserPermission.findOneAndUpdate(
      { userRef: user._id },
      {
        allowedAreas,
        revokedAreas,
        updatedBy: req.user?.userId || null,
        updatedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    // Log admin audit
    if (req.user) {
      await AdminAuditLog.create({
        adminRef: req.user.userId,
        adminName: req.user.email,
        action: "update_user_permissions",
        targetType: "user_permission",
        targetId: user._id.toString(),
        details: { userId: user._id, email: user.email, allowedAreasCount: allowedAreas.length, revokedAreasCount: revokedAreas.length },
      });
    }

    res.status(200).json({
      message: "User permissions updated successfully",
      userPerm,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating user permissions", error: error.message });
  }
};

// POST /api/permissions/user/:userId/refresh — Reset user permissions to role defaults
exports.refreshUserPermissions = async (req, res) => {
  try {
    const user = await Users.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user-specific overrides
    await UserPermission.findOneAndDelete({ userRef: user._id });

    // Log admin audit
    if (req.user) {
      await AdminAuditLog.create({
        adminRef: req.user.userId,
        adminName: req.user.email,
        action: "refresh_user_permissions",
        targetType: "user_permission",
        targetId: user._id.toString(),
        details: { userId: user._id, email: user.email },
      });
    }

    res.status(200).json({ message: "User permissions refreshed to role defaults" });
  } catch (error) {
    res.status(500).json({ message: "Error refreshing user permissions", error: error.message });
  }
};