const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");

// Helper to sign JWT
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production",
    { expiresIn: "7d" }
  );
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, password, staffId, department } = req.body;

    if (!email || !password || !staffId || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingStaff = await Staff.findOne({
      $or: [{ email: email.toLowerCase() }, { staffId }],
    });

    if (existingStaff) {
      return res.status(400).json({ message: "Staff email or ID already registered" });
    }

    // Auto-detect role: if email includes 'admin', make them Admin, otherwise default Staff
    const role = email.toLowerCase().includes("admin") ? "admin" : "staff";
    const name = req.body.name || (email.split("@")[0] || "User").split(".").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStaff = new Staff({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      staffId,
      department,
      role,
    });

    await newStaff.save();
    const token = generateToken(newStaff);

    res.status(201).json({
      access_token: token,
      message: "Registration successful",
      user: {
        id: newStaff._id,
        email: newStaff.email,
        staffId: newStaff.staffId,
        department: newStaff.department,
        role: newStaff.role,
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
      let defaultAdmin = await Staff.findOne({ email: "admin@nfc.com" });
      if (!defaultAdmin) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        defaultAdmin = new Staff({
          name: "Admin User",
          email: "admin@nfc.com",
          password: hashedPassword,
          staffId: "ADMIN001",
          department: "IT",
          role: "admin",
        });
        await defaultAdmin.save();
        console.log("Seeded default admin user: admin@nfc.com");
      }
    }

    const staff = await Staff.findOne({ email: email.toLowerCase() });
    if (!staff) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(staff);

    res.status(200).json({
      access_token: token,
      message: "Login successful",
      user: {
        id: staff._id,
        email: staff.email,
        staffId: staff.staffId,
        department: staff.department,
        role: staff.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.userId).select("-password");
    if (!staff) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(staff);
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
