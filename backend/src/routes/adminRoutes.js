const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");
const Users = require("../models/Users");
const AdminAuditLog = require("../models/AdminAuditLog");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Generate a secure random temporary password
function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(crypto.randomInt(chars.length));
  }
  return "A" + password.slice(1, -1) + "1!";
}

// GET /api/Admin/check-role
router.get("/check-role", authenticate, (req, res) => {
  if (req.user && req.user.role === "admin") {
    return res.status(200).json({ role: "admin" });
  }
  return res.status(403).json({ message: "Not authorized as admin" });
});

// GET /api/Admin/total-staffs
router.get("/total-staffs", authenticate, async (req, res) => {
  try {
    const count = await Users.countDocuments();
    res.status(200).json({ totalStaffs: count });
  } catch (error) {
    res.status(500).json({ message: "Error counting users", error: error.message });
  }
});

// GET /api/Admin/total-departments
router.get("/total-departments", authenticate, async (req, res) => {
  try {
    const depts = await Users.distinct("department");
    const count = depts.length || 3;
    res.status(200).json({ totalDepartments: count });
  } catch (error) {
    res.status(500).json({ message: "Error counting departments", error: error.message });
  }
});

// GET /api/Admin/get/all-staff
router.get("/get/all-staff", authenticate, async (req, res) => {
  try {
    const userList = await Users.find().select("-password -resetPasswordToken -resetPasswordExpires");
    const mappedList = userList.map(u => {
      const obj = u.toObject();
      obj.id = u._id.toString();
      return obj;
    });
    res.status(200).json(mappedList);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user list", error: error.message });
  }
});

// POST /api/Admin/invite
router.post("/invite", authenticate, async (req, res) => {
  try {
    const { name, staffId, department, email, phone, photo, firstName, lastName, role } = req.body;

    if (!name || !staffId || !department || !email) {
      return res.status(400).json({ message: "Name, Staff ID, Department, and Email are required" });
    }

    const existingUser = await Users.findOne({
      $or: [{ email: email.toLowerCase() }, { staffId }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User email or ID already registered" });
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = new Users({
      name,
      firstName: firstName || name.split(" ")[0] || "",
      lastName: lastName || name.split(" ").slice(1).join(" ") || "",
      email: email.toLowerCase(),
      password: hashedPassword,
      staffId,
      department,
      phone,
      profilePhoto: photo,
      status: "active",
      role: role || "staff",
      mustChangePassword: true, // Force password change on first login
      createdBy: req.user.userId,
    });

    await newUser.save();

    // Log admin audit
    if (req.user) {
      await AdminAuditLog.create({
        adminRef: req.user.userId,
        adminName: req.user.email,
        action: "create_user",
        targetType: "user",
        targetId: newUser._id.toString(),
        details: { email: newUser.email, staffId: newUser.staffId },
      });
    }

    const userObj = newUser.toObject();
    delete userObj.password;
    delete userObj.resetPasswordToken;
    delete userObj.resetPasswordExpires;
    userObj.id = newUser._id.toString();

    res.status(201).json({
      message: "Staff member added successfully",
      staff: userObj,
      // Return the temporary password so the admin can share it with the user
      tempPassword,
      tempPasswordMessage: `User can login with email ${newUser.email} and temporary password: ${tempPassword}. They will be prompted to change it on first login.`,
    });
  } catch (error) {
    console.error("Invite error:", error);
    res.status(500).json({ message: "Error inviting staff member" });
  }
});

// GET /api/Admin/getstaffby/:id
router.get("/getstaffby/:id", authenticate, async (req, res) => {
  try {
    const user = await Users.findById(req.params.id).select("-password -resetPasswordToken -resetPasswordExpires");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userObj = user.toObject();
    userObj.id = user._id.toString();
    res.status(200).json(userObj);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
});

// PUT /api/Admin/update/staff/:id
router.put("/update/staff/:id", authenticate, async (req, res) => {
  try {
    const { name, department, email, phone, photo, status, firstName, lastName } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (department) updateData.department = department;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (photo) updateData.profilePhoto = photo;
    if (status) updateData.status = status;

    const updatedUser = await Users.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const userObj = updatedUser.toObject();
    userObj.id = updatedUser._id.toString();
    res.status(200).json({
      message: "Staff member updated successfully",
      staff: userObj
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating staff", error: error.message });
  }
});

// DELETE /api/Admin/delete/staff/:id
router.delete("/delete/staff/:id", authenticate, async (req, res) => {
  try {
    const deletedUser = await Users.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log admin audit
    if (req.user) {
      await AdminAuditLog.create({
        adminRef: req.user.userId,
        adminName: req.user.email,
        action: "delete_user",
        targetType: "user",
        targetId: req.params.id,
        details: { email: deletedUser.email, staffId: deletedUser.staffId },
      });
    }

    res.status(200).json({ message: "Staff member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting staff", error: error.message });
  }
});

// GET /api/Admin/dashboard
router.get("/dashboard", authenticate, async (req, res) => {
  try {
    const totalStaff = await Users.countDocuments();
    const depts = await Users.distinct("department");
    
    res.status(200).json({
      totalStaff,
      totalDepartments: depts.length || 3,
      recentActivity: [
        { id: 1, action: "Admin login successful", time: new Date() },
        { id: 2, action: "Default database configuration active", time: new Date() }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: "Error loading dashboard", error: error.message });
  }
});

module.exports = router;