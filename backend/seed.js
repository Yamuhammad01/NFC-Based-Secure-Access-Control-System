const mongoose = require("mongoose");
require("dotenv").config();
const Users = require("./src/models/Users");
const NfcCardInfo = require("./src/models/NfcCardInfo");
const Reader = require("./src/models/Reader");
const Department = require("./src/models/Department");
const RolePermission = require("./src/models/RolePermission");
const { ROLES, STATUS } = require("./src/config/constants");
const bcrypt = require("bcryptjs");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/nfc_access_control");
    console.log("Connected to MongoDB for seeding...");
  } catch (err) {
    console.error("DB Connection Error:", err);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await Users.deleteMany({});
  await NfcCardInfo.deleteMany({});
  await Reader.deleteMany({});
  await Department.deleteMany({});

  // 1. Seed Departments
  const departments = [
    { name: "Information Technology", code: "IT", description: "IT Department", isActive: true },
    { name: "Registry & Academic Affairs", code: "REG", description: "Academic Registry", isActive: true },
    { name: "Science Laboratory", code: "SCI", description: "Science Department", isActive: true },
    { name: "Administration", code: "ADMIN", description: "University Administration", isActive: true },
  ];
  await Department.insertMany(departments);
  console.log("Departments seeded.");

  // 2. Seed Users (Auth accounts for staff, admin, and students)
  const hashedPassword = await bcrypt.hash("password123", 10);
  const adminHashedPassword = await bcrypt.hash("admin123", 10);

  const users = [
    {
      name: "Admin User",
      firstName: "Admin",
      lastName: "User",
      email: "admin@nfc.com",
      password: adminHashedPassword,
      staffId: "ADMIN001",
      department: "Information Technology",
      role: "admin",
      status: "active",
      phone: "+1 (555) 000-0001",
    },
    {
      name: "Dr. Sarah Smith",
      firstName: "Sarah",
      lastName: "Smith",
      email: "sarah.smith@university.edu",
      password: hashedPassword,
      staffId: "STF2026001",
      department: "Registry & Academic Affairs",
      role: "staff",
      status: "active",
      phone: "+1 (555) 019-2834",
      position: "Senior Registry Officer",
      jobTitle: "Administrative Director",
    },
    {
      name: "John Doe",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@university.edu",
      password: hashedPassword,
      staffId: "STU2026001",
      department: "Science Laboratory",
      role: "student",
      status: "active",
      phone: "+1 (555) 019-2835",
      position: "Undergraduate Student",
      jobTitle: "Student",
    },
  ];
  const createdUsers = await Users.insertMany(users);
  console.log("Users seeded.");

  // 3. Seed NFC Cards (NfcCardInfo)
  const nfcCards = [
    {
      uid: "04AA112233",
      name: "Admin User",
      role: ROLES.ADMIN,
      accessLevel: 3,
      status: STATUS.ACTIVE,
      allowedTime: { start: "00:00", end: "23:59" },
      isInside: false,
      userRef: createdUsers[0]._id, // link to admin user
    },
    {
      uid: "0499887766",
      name: "Dr. Sarah Smith",
      role: ROLES.STAFF,
      accessLevel: 2,
      status: STATUS.ACTIVE,
      allowedTime: { start: "06:00", end: "22:00" },
      isInside: false,
      userRef: createdUsers[1]._id, // link to staff user
    },
    {
      uid: "0455667788",
      name: "John Doe",
      role: ROLES.STUDENT,
      accessLevel: 1,
      status: STATUS.ACTIVE,
      allowedTime: { start: "08:00", end: "18:00" },
      isInside: false,
      userRef: createdUsers[2]._id, // link to student user
    },
    {
      uid: "REVOKED_01",
      name: "Revoked Card User",
      role: ROLES.STUDENT,
      accessLevel: 1,
      status: STATUS.REVOKED,
      allowedTime: { start: "00:00", end: "23:59" },
      isInside: false,
    },
  ];
  await NfcCardInfo.insertMany(nfcCards);
  console.log("NFC cards seeded.");

  // Update users with their assigned UIDs
  await Users.findByIdAndUpdate(createdUsers[0]._id, { uid: "04AA112233", accessLevel: 3 });
  await Users.findByIdAndUpdate(createdUsers[1]._id, { uid: "0499887766", accessLevel: 2 });
  await Users.findByIdAndUpdate(createdUsers[2]._id, { uid: "0455667788", accessLevel: 1 });
  console.log("Users updated with card UIDs.");

  // 4. Seed Role Permissions
  const rolePermissions = [
    {
      role: "admin",
      allowedAreas: [], // Admin has access to all areas (empty = grant all)
      updatedBy: null,
      updatedAt: new Date(),
    },
    {
      role: "staff",
      allowedAreas: [
        "library",
        "cafeteria",
        "medical-centre",
        "student-affairs",
        "dept-admin-office",
        "registry-office",
        "bursary-office",
        "hr-office",
        "staff-meeting-room",
        "senate-building",
        "academic-planning",
        "staff-office",
        "dept-office",
        "lab",
        "conf",
        "exec",
      ],
      updatedBy: null,
      updatedAt: new Date(),
    },
    {
      role: "student",
      allowedAreas: [
        "library",
        "cafeteria",
        "medical-centre",
        "student-affairs",
        "lab",
        "conf",
      ],
      updatedBy: null,
      updatedAt: new Date(),
    },
  ];
  await RolePermission.insertMany(rolePermissions);
  console.log("Role permissions seeded.");

  // 5. Seed Readers
  const readers = [
    { readerId: "MAIN_GATE_01", location: "Campus Entrance", direction: "in", isActive: true },
    { readerId: "LAB_01", location: "Science Building", direction: "in", isActive: true },
    { readerId: "STAFF_OFFICE_01", location: "Admin Block A", direction: "in", isActive: true },
    { readerId: "ADMIN_OFFICE_01", location: "Admin Block B", direction: "in", isActive: true },
    { readerId: "SERVER_ROOM_01", location: "IT Center", direction: "in", isActive: true },
    // Out Readers
    { readerId: "MAIN_GATE_EXIT", location: "Campus Entrance", direction: "out", isActive: true },
  ];
  await Reader.insertMany(readers);
  console.log("Readers seeded.");

  console.log("Seeding complete!");
  process.exit(0);
};

seedData();