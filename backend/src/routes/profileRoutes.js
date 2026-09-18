const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authenticate = require("../middlewares/auth");
const Users = require("../models/Users");
const { getUploadsRoot, getUploadSubdir } = require("../utils/upload");

// ──────────────────────────────────────────────
//  Multer Storage Configuration
// ──────────────────────────────────────────────
// Locally: <backend>/uploads/profile-photos
// On Vercel (serverless): /tmp/uploads/profile-photos (writable/ephemeral)
const uploadDir = getUploadSubdir("profile-photos");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize original name and prepend userId + timestamp
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitized = file.originalname
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 30);
    cb(null, `user-${req.user.userId}-${Date.now()}-${sanitized}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, GIF, and WebP images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// ──────────────────────────────────────────────
//  GET /api/get/profile
// ──────────────────────────────────────────────
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
      profilePhoto: user.profilePhoto
        ? `${req.protocol}://${req.get("host")}${user.profilePhoto}`
        : null,
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

// ──────────────────────────────────────────────
//  PUT /api/update/profile
// ──────────────────────────────────────────────
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

// ──────────────────────────────────────────────
//  POST /api/add/profilePhoto
//  Upload & persist profile photo to disk, store URL in DB
// ──────────────────────────────────────────────
router.post("/add/profilePhoto", authenticate, (req, res) => {
  upload.single("profilePhoto")(req, res, async (err) => {
    // Handle multer errors
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File too large. Maximum size is 5MB." });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded. Please select a profile photo." });
      }

      // Build the relative URL for the uploaded file
      const photoUrl = `/uploads/profile-photos/${req.file.filename}`;

      // Delete old photo if it exists (local file)
      const currentUser = await Users.findById(req.user.userId);
      if (currentUser && currentUser.profilePhoto) {
        // profilePhoto is stored as "/uploads/profile-photos/<file>".
        // Normalize it to a path relative to the active uploads root.
        const relative = currentUser.profilePhoto.replace(/^\/uploads\//, "");
        const oldPhotoPath = path.join(getUploadsRoot(), relative);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      // Update user's profilePhoto in DB
      await Users.findByIdAndUpdate(req.user.userId, { profilePhoto: photoUrl });

      res.status(200).json({
        message: "Profile photo uploaded successfully",
        photoUrl,
      });
    } catch (error) {
      console.error("profilePhoto upload error:", error);
      // Clean up uploaded file on error
      if (req.file) {
        const filePath = path.join(uploadDir, req.file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
});

module.exports = router;