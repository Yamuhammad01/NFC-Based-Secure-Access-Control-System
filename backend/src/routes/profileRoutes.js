const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");
const Users = require("../models/Users");

// GET /api/get/profile
router.get("/get/profile", authenticate, async (req, res) => {
  try {
    const user = await Users.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User profile not found" });
    }

    res.status(200).json({
      id: user._id,
      firstName: user.firstName || user.name?.split(" ")[0] || "",
      lastName: user.lastName || user.name?.split(" ").slice(1).join(" ") || "",
      name: user.name,
      email: user.email,
      staffId: user.staffId,
      department: user.department,
      role: user.role,
      phone: user.phone,
      profilePhoto: user.profilePhoto || null,
      jobTitle: user.jobTitle,
      position: user.position,
      uid: user.uid,
      accessLevel: user.accessLevel,
      status: user.status,
      allowedTime: user.allowedTime,
      smartId: user.staffId,
    });
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT /api/update/profile
router.put("/update/profile", authenticate, async (req, res) => {
  try {
    const { email, phone, firstName, lastName } = req.body;
    const updateData = {};
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    const updatedUser = await Users.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/add/profilePhoto
router.post("/add/profilePhoto", authenticate, async (req, res) => {
  try {
    // For now, return mock success. In production, handle file upload to cloud storage.
    res.status(200).json({
      message: "Profile photo uploaded successfully",
      photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;