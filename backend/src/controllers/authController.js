const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Users = require("../models/Users");
const AdminAuditLog = require("../models/AdminAuditLog");

// Helper to sign JWT
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production",
    { expiresIn: "7d" }
  );
};

// Generate a secure random temporary password
const generateTempPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(crypto.randomInt(chars.length));
  }
  // Ensure at least one uppercase, one lowercase, one number, one special
  password = "A" + password.slice(1, -1) + "1!";
  return password;
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, password, staffId, department, firstName, lastName, name } = req.body;

    if (!email || !password || !staffId || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await Users.findOne({
      $or: [{ email: email.toLowerCase() }, { staffId }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User email or ID already registered" });
    }

    // Auto-detect role: if email includes 'admin', make them Admin, otherwise default Staff
    const role = email.toLowerCase().includes("admin") ? "admin" : "staff";
    const fullName = name || firstName || (email.split("@")[0] || "User").split(".").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Users({
      name: fullName,
      firstName: firstName || fullName.split(" ")[0] || "",
      lastName: lastName || fullName.split(" ").slice(1).join(" ") || "",
      email: email.toLowerCase(),
      password: hashedPassword,
      staffId,
      department,
      role,
      // Self-registered users set their own password, so no need to change
      mustChangePassword: false,
    });

    await newUser.save();

    // Log admin audit if creator is admin
    if (req.user && req.user.role === "admin") {
      await AdminAuditLog.create({
        adminRef: req.user.userId,
        adminName: req.user.email,
        action: "create_user",
        targetType: "user",
        targetId: newUser._id.toString(),
        details: { email: newUser.email, staffId: newUser.staffId },
      });
    }

    const token = generateToken(newUser);

    res.status(201).json({
      access_token: token,
      message: "Registration successful",
      user: {
        id: newUser._id,
        email: newUser.email,
        staffId: newUser.staffId,
        department: newUser.department,
        role: newUser.role,
        name: newUser.name,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        mustChangePassword: newUser.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Automatic seed for default admin login (admin@nfc.com / admin123)
    if (email.toLowerCase() === "admin@nfc.com" && password === "admin123") {
      let defaultAdmin = await Users.findOne({ email: "admin@nfc.com" });
      if (!defaultAdmin) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        defaultAdmin = new Users({
          name: "Admin User",
          firstName: "Admin",
          lastName: "User",
          email: "admin@nfc.com",
          password: hashedPassword,
          staffId: "ADMIN001",
          department: "IT",
          role: "admin",
          mustChangePassword: false,
        });
        await defaultAdmin.save();
        console.log("Seeded default admin user: admin@nfc.com");
      }
    }

    const user = await Users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if account is active
    if (user.status === "inactive") {
      return res.status(403).json({ message: "Account is deactivated. Contact your administrator." });
    }

    const token = generateToken(user);

    res.status(200).json({
      access_token: token,
      message: "Login successful",
      mustChangePassword: user.mustChangePassword,
      user: {
        id: user._id,
        email: user.email,
        staffId: user.staffId,
        department: user.department,
        role: user.role,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePhoto: user.profilePhoto,
        phone: user.phone,
        uid: user.uid,
        accessLevel: user.accessLevel,
        jobTitle: user.jobTitle,
        position: user.position,
        status: user.status,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/auth/change-password — Change password (for first-time login or general change)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const user = await Users.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash and set new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.mustChangePassword = false; // Clear the flag
    await user.save();

    // Generate new token
    const token = generateToken(user);

    res.status(200).json({
      message: "Password changed successfully",
      access_token: token,
      mustChangePassword: false,
    });
  } catch (error) {
    console.error("changePassword error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/auth/forgot-password — Request password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await Users.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal whether the email exists
      return res.status(200).json({ message: "If an account with that email exists, a reset link has been sent." });
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Store hashed token and expiry (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // In production, send this via email. For now, return it in the response
    // so the admin can share it with the user.
    // The reset link format: http://localhost:5173/#access_token=TOKEN&type=recovery
    const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/#access_token=${resetToken}&type=recovery`;

    console.log(`[DEV] Password reset link for ${user.email}: ${resetLink}`);

    res.status(200).json({
      message: "If an account with that email exists, a reset link has been sent.",
      // In development, return the link directly so it can be shared
      ...(process.env.NODE_ENV !== "production" && { resetLink, resetToken }),
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/auth/reset-password — Complete password reset
exports.resetPassword = async (req, res) => {
  try {
    const { accessToken, newPassword } = req.body;

    if (!accessToken || !newPassword) {
      return res.status(400).json({ message: "Access token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Find all users with a reset token that hasn't expired
    const users = await Users.find({
      resetPasswordExpires: { $gt: new Date() },
    });

    // Find the user whose hashed token matches
    let targetUser = null;
    for (const user of users) {
      if (user.resetPasswordToken) {
        const isValid = await bcrypt.compare(accessToken, user.resetPasswordToken);
        if (isValid) {
          targetUser = user;
          break;
        }
      }
    }

    if (!targetUser) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash and set new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    targetUser.password = hashedPassword;
    targetUser.mustChangePassword = false;
    targetUser.resetPasswordToken = null;
    targetUser.resetPasswordExpires = null;
    await targetUser.save();

    res.status(200).json({
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("resetPassword error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await Users.findById(req.user.userId).select("-password -resetPasswordToken -resetPasswordExpires");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};