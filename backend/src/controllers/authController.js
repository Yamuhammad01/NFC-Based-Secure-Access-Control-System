const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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

    const token = generateToken(user);

    res.status(200).json({
      access_token: token,
      message: "Login successful",
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
    const user = await Users.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};