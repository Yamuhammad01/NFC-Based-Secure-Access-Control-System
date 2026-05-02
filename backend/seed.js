const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./src/models/User");
const Reader = require("./src/models/Reader");
const { ROLES, STATUS } = require("./src/config/constants");

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
  await User.deleteMany({});
  await Reader.deleteMany({});

  // 1. Seed Readers
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

  // 2. Seed Users
  const users = [
    {
      uid: "04AA112233",
      name: "John Doe (Student)",
      role: ROLES.STUDENT,
      accessLevel: 1,
      status: STATUS.ACTIVE,
      allowedTime: { start: "08:00", end: "18:00" },
      isInside: false
    },
    {
      uid: "0499887766",
      name: "Dr. Sarah Smith (Staff)",
      role: ROLES.STAFF,
      accessLevel: 2,
      status: STATUS.ACTIVE,
      allowedTime: { start: "06:00", end: "22:00" },
      isInside: false
    },
    {
      uid: "0455667788",
      name: "Admin User",
      role: ROLES.ADMIN,
      accessLevel: 3,
      status: STATUS.ACTIVE,
      allowedTime: { start: "00:00", end: "23:59" },
      isInside: false
    },
    {
      uid: "REVOKED_01",
      name: "Revoked Card User",
      role: ROLES.STUDENT,
      accessLevel: 1,
      status: STATUS.REVOKED,
      allowedTime: { start: "00:00", end: "23:59" },
      isInside: false
    }
  ];
  await User.insertMany(users);
  console.log("Users seeded.");

  console.log("Seeding complete!");
  process.exit(0);
};

seedData();
