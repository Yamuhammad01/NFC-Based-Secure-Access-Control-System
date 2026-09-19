const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authenticate = require("../middlewares/auth");
const Users = require("../models/Users");
const {
  getUploadsRoot,
  getUploadSubdir,
  isRemoteUrl,
  resolvePhotoUrl,
} = require("../utils/upload");
const {
  isCloudinaryEnabled,
  uploadImageBuffer,
  deleteImageByUrl,
  isCloudinaryUrl,
} = require("../utils/cloudinary");

// ──────────────────────────────────────────────
//  Multer Storage Configuration (dual mode)
// ──────────────────────────────────────────────
// Cloudinary configured -> memory storage, buffer is streamed to the cloud
//                          (persistent — works on Vercel).
// Otherwise             -> disk storage:
//                          locally:  <backend>/uploads/profile-photos
//                          on Vercel: /tmp/uploads/profile-photos (ephemeral)
//
// The directory is created lazily (first upload only) so module import can
// never fail on a read-only filesystem.
const getUploadDir = () => getUploadSubdir("profile-photos");

const CLOUDINARY_FOLDER =
  process.env.CLOUDINARY_FOLDER || "nfc-access-control/profile-photos";

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadDir());
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
  // Cloudinary mode keeps the file in memory and streams it to the cloud;
  // local mode writes to disk exactly as before.
  storage: isCloudinaryEnabled() ? multer.memoryStorage() : diskStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

/** Deletes a previously stored photo (Cloudinary asset or local file). */
const removeStoredPhoto = async (stored) => {
  if (!stored) return;
  if (isCloudinaryUrl(stored)) {
    await deleteImageByUrl(stored);
    return;
  }
  if (isRemoteUrl(stored)) return; // external URL — 
  // Local disk file: "/uploads/profile-photos/<file>"
  const relative = stored.replace(/^\/+/, "").replace(/^uploads\//, "");
  const oldPhotoPath = path.join(getUploadsRoot(), relative);
  if (fs.existsSync(oldPhotoPath)) {
    fs.unlinkSync(oldPhotoPath);
  }
};

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
      profilePhoto: resolvePhotoUrl(req, user.profilePhoto),
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

      const useCloudinary = isCloudinaryEnabled();
      const currentUser = await Users.findById(req.user.userId);
      const previousPhoto = currentUser ? currentUser.profilePhoto : null;

      let photoUrl;
      if (useCloudinary) {
        // Persist to Cloudinary — survives Vercel cold starts and redeploys.
        const result = await uploadImageBuffer(req.file.buffer, {
          folder: CLOUDINARY_FOLDER,
          publicId: `user-${req.user.userId}-${Date.now()}`,
        });
        photoUrl = result.secure_url;
      } else {
        // Local/disk fallback (development, or Vercel without Cloudinary creds)
        photoUrl = `/uploads/profile-photos/${req.file.filename}`;
      }

      // Replace the previous photo only after the new one is safely stored.
      await removeStoredPhoto(previousPhoto);

      // Update user's profilePhoto in DB
      await Users.findByIdAndUpdate(req.user.userId, { profilePhoto: photoUrl });

      res.status(200).json({
        message: "Profile photo uploaded successfully",
        photoUrl,
        storage: useCloudinary ? "cloudinary" : "local",
      });
    } catch (error) {
      console.error("profilePhoto upload error:", error);
      // Clean up the freshly uploaded file on error
      if (req.file && !isCloudinaryEnabled() && req.file.filename) {
        const filePath = path.join(getUploadDir(), req.file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      const message = isCloudinaryEnabled()
        ? "Failed to upload photo to cloud storage. Please try again."
        : "Internal server error";
      res.status(500).json({ message });
    }
  });
});

module.exports = router;