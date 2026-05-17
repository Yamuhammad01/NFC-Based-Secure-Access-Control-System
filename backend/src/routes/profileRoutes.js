const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");
const Staff = require("../models/Staff");

// GET /api/get/profile
router.get("/get/profile", authenticate, async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.userId);
    if (!staff) {
      return res.status(404).json({ message: "Staff profile not found" });
    }

    // Split name or use defaults for firstName/lastName
    const nameParts = (staff.email.split("@")[0] || "Admin").split(".");
    const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
    const lastName = nameParts[1] ? (nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1)) : "User";

    res.status(200).json({
      id: staff.staffId,
      firstName: staff.role === "admin" ? "Admin" : firstName,
      lastName: staff.role === "admin" ? "User" : lastName,
      email: staff.email,
      department: staff.department,
      role: staff.role,
      profilePhoto: staff.photo || null
    });
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT /api/update/profile
router.put("/update/profile", authenticate, async (req, res) => {
  try {
    // Return dummy success for testing updates
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/add/profilePhoto
router.post("/add/profilePhoto", authenticate, async (req, res) => {
  try {
    // Return mock photo URI for testing profile photo uploads
    res.status(200).json({
      message: "Profile photo uploaded successfully",
      photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
