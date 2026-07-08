const express = require("express");
const router = express.Router();
const permissionController = require("../controllers/permissionController");

// All permission routes require authentication
router.use((req, res, next) => {
  // Auth middleware will be applied at app.js level or here
  next();
});

// Role permission routes
router.get("/role/:role", permissionController.getRolePermissions);
router.put("/role/:role", permissionController.updateRolePermissions);

// User permission routes
router.get("/user/:userId", permissionController.getUserPermissions);
router.put("/user/:userId", permissionController.updateUserPermissions);
router.post("/user/:userId/refresh", permissionController.refreshUserPermissions);

module.exports = router;