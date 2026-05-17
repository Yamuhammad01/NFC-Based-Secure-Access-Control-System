const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");
const Staff = require("../models/Staff");
const bcrypt = require("bcryptjs");

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
    const count = await Staff.countDocuments();
    res.status(200).json({ totalStaffs: count });
  } catch (error) {
    res.status(500).json({ message: "Error counting staff", error: error.message });
  }
});

// GET /api/Admin/total-departments
router.get("/total-departments", authenticate, async (req, res) => {
  try {
    const depts = await Staff.distinct("department");
    const count = depts.length || 3;
    res.status(200).json({ totalDepartments: count });
  } catch (error) {
    res.status(500).json({ message: "Error counting departments", error: error.message });
  }
});

// GET /api/Admin/get/all-staff
router.get("/get/all-staff", authenticate, async (req, res) => {
  try {
    const staffList = await Staff.find().select("-password");
    const mappedList = staffList.map(s => {
      const obj = s.toObject();
      obj.id = s._id.toString();
      return obj;
    });
    res.status(200).json(mappedList);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving staff list", error: error.message });
  }
});

// POST /api/Admin/invite
router.post("/invite", authenticate, async (req, res) => {
  try {
    const { name, staffId, department, email, phone, photo } = req.body;

    if (!name || !staffId || !department || !email) {
      return res.status(400).json({ message: "Name, Staff ID, Department, and Email are required" });
    }

    const existingStaff = await Staff.findOne({
      $or: [{ email: email.toLowerCase() }, { staffId }],
    });

    if (existingStaff) {
      return res.status(400).json({ message: "Staff email or ID already registered" });
    }

    const hashedPassword = await bcrypt.hash("password123", 10); // default password

    const newStaff = new Staff({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      staffId,
      department,
      phone,
      photo,
      status: "active",
      role: "staff"
    });

    await newStaff.save();

    const staffObj = newStaff.toObject();
    staffObj.id = newStaff._id.toString();

    res.status(201).json({
      message: "Staff member added successfully",
      staff: staffObj
    });
  } catch (error) {
    console.error("Invite error:", error);
    res.status(500).json({ message: "Error inviting staff member" });
  }
});

// GET /api/Admin/getstaffby/:id
router.get("/getstaffby/:id", authenticate, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }
    const staffObj = staff.toObject();
    staffObj.id = staff._id.toString();
    res.status(200).json(staffObj);
  } catch (error) {
    res.status(500).json({ message: "Error fetching staff", error: error.message });
  }
});

// PUT /api/Admin/update/staff/:id
router.put("/update/staff/:id", authenticate, async (req, res) => {
  try {
    const { name, department, email, phone, photo, status } = req.body;
    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      { name, department, email, phone, photo, status },
      { new: true }
    );
    if (!updatedStaff) {
      return res.status(404).json({ message: "Staff not found" });
    }
    const staffObj = updatedStaff.toObject();
    staffObj.id = updatedStaff._id.toString();
    res.status(200).json({
      message: "Staff member updated successfully",
      staff: staffObj
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating staff", error: error.message });
  }
});

// DELETE /api/Admin/delete/staff/:id
router.delete("/delete/staff/:id", authenticate, async (req, res) => {
  try {
    const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
    if (!deletedStaff) {
      return res.status(404).json({ message: "Staff not found" });
    }
    res.status(200).json({ message: "Staff member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting staff", error: error.message });
  }
});

// GET /api/Admin/dashboard
router.get("/dashboard", authenticate, async (req, res) => {
  try {
    const totalStaff = await Staff.countDocuments();
    const depts = await Staff.distinct("department");
    
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
