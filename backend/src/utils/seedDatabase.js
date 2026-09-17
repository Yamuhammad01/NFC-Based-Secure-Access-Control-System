require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const Users = require("../models/Users");
const NfcCardInfo = require("../models/NfcCardInfo");
const AccessLog = require("../models/AccessLog");
const TemporaryAccess = require("../models/TemporaryAccess");
const Reader = require("../models/Reader");
const Department = require("../models/Department");
const RolePermission = require("../models/RolePermission");
const { ROLES, STATUS, ACCESS_RESULT } = require("../config/constants");

const seedDatabase = async () => {
  try {
    console.log(" Starting NFC Access Control System Database Seeding...");

    // Connect to MongoDB
    await connectDB();

    // Clear existing collections
    console.log(" Clearing old database records...");
    await Promise.all([
      Users.deleteMany({}),
      NfcCardInfo.deleteMany({}),
      AccessLog.deleteMany({}),
      TemporaryAccess.deleteMany({}),
      Reader.deleteMany({}),
      Department.deleteMany({}),
      RolePermission.deleteMany({}),
    ]);

    // Hashed Passwords
    const adminPassword = await bcrypt.hash("AdminPassword123!", 10);
    const staffPassword = await bcrypt.hash("StaffPassword123!", 10);
    const studentPassword = await bcrypt.hash("StudentPassword123!", 10);

    // ─────────────────────────────────────────────────────────────────────────
    // 1. SEED DEPARTMENTS
    // ─────────────────────────────────────────────────────────────────────────
    console.log(" Seeding Departments...");
    const seededDepartments = await Department.insertMany([
      { name: "Information Technology & Security", code: "ITS", description: "Central IT and Infrastructure" },
      { name: "Computer Science", code: "CSC", description: "Department of Computer Science" },
      { name: "Electrical Engineering", code: "EEE", description: "Department of Electrical Engineering" },
      { name: "Software Engineering", code: "SEN", description: "Department of Software Engineering" },
      { name: "Cyber Security", code: "CYB", description: "Department of Cyber Security" },
    ]);

    // ─────────────────────────────────────────────────────────────────────────
    // 2. SEED USERS
    // ─────────────────────────────────────────────────────────────────────────
    console.log("👥 Seeding Demo Users...");

    const usersToCreate = [
      // 1. Admin Account
      {
        name: "Dr. Babatunde Lawal",
        firstName: "Babatunde",
        lastName: "Lawal",
        email: "admin@university.edu.ng",
        password: adminPassword,
        staffId: "ADM-001",
        department: "Information Technology & Security",
        jobTitle: "Chief Information Security Officer",
        role: "admin",
        status: "active",
        mustChangePassword: false,
        uid: "ADM88888",
        accessLevel: 3,
        cardStatus: "active",
        phone: "+2348031112233",
      },
      // 2. Staff Account 1 (Active Senior Lecturer)
      {
        name: "Prof. Chinedu Okafor",
        firstName: "Chinedu",
        lastName: "Okafor",
        email: "staff@university.edu.ng",
        password: staffPassword,
        staffId: "STF-1001",
        department: "Computer Science",
        jobTitle: "Senior Lecturer & AI Director",
        role: "staff",
        status: "active",
        mustChangePassword: false,
        uid: "STF10001",
        accessLevel: 2,
        cardStatus: "active",
        phone: "+2348034445566",
      },
      // 3. Staff Account 2 (Active Researcher with Replacement Card History)
      {
        name: "Dr. Amina Bello",
        firstName: "Amina",
        lastName: "Bello",
        email: "staff2@university.edu.ng",
        password: staffPassword,
        staffId: "STF-1002",
        department: "Electrical Engineering",
        jobTitle: "Research Associate",
        role: "staff",
        status: "active",
        mustChangePassword: false,
        uid: "STF10002",
        accessLevel: 2,
        cardStatus: "active",
        phone: "+2348037778899",
      },
      // 4. Student Account 1 (Active Undergraduate)
      {
        name: "Adebayo Oluwaseun",
        firstName: "Adebayo",
        lastName: "Oluwaseun",
        email: "student@university.edu.ng",
        password: studentPassword,
        staffId: "STD-202401",
        department: "Software Engineering",
        jobTitle: "Undergraduate Scholar",
        role: "student",
        status: "active",
        mustChangePassword: false,
        uid: "STD20001",
        accessLevel: 1,
        cardStatus: "active",
        phone: "+2348051234567",
      },
      // 5. Student Account 2 (Suspended / Lost Card)
      {
        name: "Ngozi Eze",
        firstName: "Ngozi",
        lastName: "Eze",
        email: "student2@university.edu.ng",
        password: studentPassword,
        staffId: "STD-202402",
        department: "Cyber Security",
        jobTitle: "Student Researcher",
        role: "student",
        status: "active",
        mustChangePassword: false,
        uid: "STD20002",
        accessLevel: 1,
        cardStatus: "suspended",
        phone: "+2348059876543",
      },
      // Additional Demo Accounts for Rich Metrics
      {
        name: "Engr. Emmanuel Danjuma",
        firstName: "Emmanuel",
        lastName: "Danjuma",
        email: "e.danjuma@university.edu.ng",
        password: staffPassword,
        staffId: "STF-1003",
        department: "Electrical Engineering",
        jobTitle: "Lab Administrator",
        role: "staff",
        status: "active",
        mustChangePassword: false,
        uid: "STF10003",
        accessLevel: 2,
        cardStatus: "active",
      },
      {
        name: "Fatima Alhassan",
        firstName: "Fatima",
        lastName: "Alhassan",
        email: "f.alhassan@university.edu.ng",
        password: studentPassword,
        staffId: "STD-202403",
        department: "Computer Science",
        jobTitle: "Graduate Student",
        role: "student",
        status: "active",
        mustChangePassword: false,
        uid: "STD20003",
        accessLevel: 1,
        cardStatus: "active",
      },
      {
        name: "Kemi Adeleke",
        firstName: "Kemi",
        lastName: "Adeleke",
        email: "k.adeleke@university.edu.ng",
        password: studentPassword,
        staffId: "STD-202404",
        department: "Software Engineering",
        jobTitle: "Undergraduate Student",
        role: "student",
        status: "active",
        mustChangePassword: false,
        uid: "STD20004",
        accessLevel: 1,
        cardStatus: "revoked",
      },
    ];

    const seededUsers = await Users.insertMany(usersToCreate);
    console.log(` Created ${seededUsers.length} Users.`);

    // Map Users by email for easy reference
    const userMap = {};
    seededUsers.forEach((u) => {
      userMap[u.email] = u;
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 3. SEED NFC CARDS (NfcCardInfo)
    // ─────────────────────────────────────────────────────────────────────────
    console.log(" Seeding NFC Cards & Replacement Lineage...");

    const cardsToCreate = [
      {
        uid: "ADM88888",
        userRef: userMap["admin@university.edu.ng"]._id,
        name: "Dr. Babatunde Lawal",
        role: ROLES.ADMIN,
        accessLevel: 3,
        status: STATUS.ACTIVE,
        issuedBy: userMap["admin@university.edu.ng"]._id,
      },
      {
        uid: "STF10001",
        userRef: userMap["staff@university.edu.ng"]._id,
        name: "Prof. Chinedu Okafor",
        role: ROLES.STAFF,
        accessLevel: 2,
        status: STATUS.ACTIVE,
        issuedBy: userMap["admin@university.edu.ng"]._id,
      },
      {
        uid: "STF10002",
        userRef: userMap["staff2@university.edu.ng"]._id,
        name: "Dr. Amina Bello",
        role: ROLES.STAFF,
        accessLevel: 2,
        status: STATUS.ACTIVE,
        isReplacement: true,
        issuedBy: userMap["admin@university.edu.ng"]._id,
        replacementHistory: [
          {
            oldUid: "STF09999",
            newUid: "STF10002",
            replacedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            replacedByName: "Dr. Babatunde Lawal",
            reason: "Previous card reported damaged",
          },
        ],
      },
      {
        uid: "STD20001",
        userRef: userMap["student@university.edu.ng"]._id,
        name: "Adebayo Oluwaseun",
        role: ROLES.STUDENT,
        accessLevel: 1,
        status: STATUS.ACTIVE,
        issuedBy: userMap["admin@university.edu.ng"]._id,
      },
      {
        uid: "STD20002",
        userRef: userMap["student2@university.edu.ng"]._id,
        name: "Ngozi Eze",
        role: ROLES.STUDENT,
        accessLevel: 1,
        status: STATUS.SUSPENDED,
        revokeReason: "lost",
        suspendedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        issuedBy: userMap["admin@university.edu.ng"]._id,
      },
      {
        uid: "STF10003",
        userRef: userMap["e.danjuma@university.edu.ng"]._id,
        name: "Engr. Emmanuel Danjuma",
        role: ROLES.STAFF,
        accessLevel: 2,
        status: STATUS.ACTIVE,
        issuedBy: userMap["admin@university.edu.ng"]._id,
      },
      {
        uid: "STD20003",
        userRef: userMap["f.alhassan@university.edu.ng"]._id,
        name: "Fatima Alhassan",
        role: ROLES.STUDENT,
        accessLevel: 1,
        status: STATUS.ACTIVE,
        issuedBy: userMap["admin@university.edu.ng"]._id,
      },
      {
        uid: "STD20004",
        userRef: userMap["k.adeleke@university.edu.ng"]._id,
        name: "Kemi Adeleke",
        role: ROLES.STUDENT,
        accessLevel: 1,
        status: STATUS.REVOKED,
        revokeReason: "misuse",
        revokedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        issuedBy: userMap["admin@university.edu.ng"]._id,
      },
    ];

    const seededCards = await NfcCardInfo.insertMany(cardsToCreate);
    console.log(` Created ${seededCards.length} NFC Cards.`);

    // ─────────────────────────────────────────────────────────────────────────
    // 4. SEED HARDWARE READERS
    // ─────────────────────────────────────────────────────────────────────────
    console.log(" Seeding Hardware Readers...");

    const readersToCreate = [
      {
        readerId: "RD-001",
        name: "Main Campus Entrance Turnstile",
        location: "Main Campus Gate",
        zone: "Main Gate",
        direction: "in",
        status: "online",
        allowedRoles: ["admin", "staff", "student"],
      },
      {
        readerId: "RD-002",
        name: "Central Library Reader",
        location: "Library Building East Wing",
        zone: "Library",
        direction: "in",
        status: "online",
        allowedRoles: ["admin", "staff", "student"],
      },
      {
        readerId: "RD-003",
        name: "Data Center Server Room Door",
        location: "IT Building Level 2",
        zone: "Server Room",
        direction: "in",
        status: "online",
        allowedRoles: ["admin"],
      },
      {
        readerId: "RD-004",
        name: "CS Advanced AI Research Lab",
        location: "Faculty of Science Room 304",
        zone: "CS Research Lab",
        direction: "in",
        status: "online",
        allowedRoles: ["admin", "staff"],
      },
      {
        readerId: "RD-005",
        name: "Executive Faculty Lounge Door",
        location: "Admin Block Level 4",
        zone: "Executive Lounge",
        direction: "in",
        status: "online",
        allowedRoles: ["admin", "staff"],
      },
    ];

    const seededReaders = await Reader.insertMany(readersToCreate);
    console.log(` Created ${seededReaders.length} Hardware Readers.`);

    // ─────────────────────────────────────────────────────────────────────────
    // 5. SEED ACCESS LOGS
    // ─────────────────────────────────────────────────────────────────────────
    console.log(" Seeding Security Audit Logs...");

    const now = Date.now();
    const minute = 60 * 1000;
    const hour = 60 * minute;

    const accessLogsToCreate = [
      {
        uid: "ADM88888",
        userName: "Dr. Babatunde Lawal",
        role: "admin",
        userRef: userMap["admin@university.edu.ng"]._id,
        readerId: "RD-003",
        door: "Server Room",
        direction: "in",
        result: ACCESS_RESULT.GRANTED,
        timestamp: new Date(now - 5 * minute),
      },
      {
        uid: "STF10001",
        userName: "Prof. Chinedu Okafor",
        role: "staff",
        userRef: userMap["staff@university.edu.ng"]._id,
        readerId: "RD-004",
        door: "CS Research Lab",
        direction: "in",
        result: ACCESS_RESULT.GRANTED,
        timestamp: new Date(now - 12 * minute),
      },
      {
        uid: "STD20002",
        userName: "Ngozi Eze",
        role: "student",
        userRef: userMap["student2@university.edu.ng"]._id,
        readerId: "RD-003",
        door: "Server Room",
        direction: "in",
        result: ACCESS_RESULT.DENIED,
        reason: "Card Suspended / Reported Lost",
        timestamp: new Date(now - 25 * minute),
      },
      {
        uid: "STD20001",
        userName: "Adebayo Oluwaseun",
        role: "student",
        userRef: userMap["student@university.edu.ng"]._id,
        readerId: "RD-002",
        door: "Library",
        direction: "in",
        result: ACCESS_RESULT.GRANTED,
        timestamp: new Date(now - 45 * minute),
      },
      {
        uid: "STD20001",
        userName: "Adebayo Oluwaseun",
        role: "student",
        userRef: userMap["student@university.edu.ng"]._id,
        readerId: "RD-002",
        door: "Library",
        direction: "in",
        result: ACCESS_RESULT.DENIED,
        reason: "Anti-Passback Violation: Already Inside",
        timestamp: new Date(now - 44 * minute),
      },
      {
        uid: "STF10002",
        userName: "Dr. Amina Bello",
        role: "staff",
        userRef: userMap["staff2@university.edu.ng"]._id,
        readerId: "RD-001",
        door: "Main Gate",
        direction: "in",
        result: ACCESS_RESULT.GRANTED,
        timestamp: new Date(now - 2 * hour),
      },
      {
        uid: "STD20004",
        userName: "Kemi Adeleke",
        role: "student",
        userRef: userMap["k.adeleke@university.edu.ng"]._id,
        readerId: "RD-001",
        door: "Main Gate",
        direction: "in",
        result: ACCESS_RESULT.DENIED,
        reason: "Card Status Revoked (Misuse)",
        timestamp: new Date(now - 4 * hour),
      },
      {
        uid: "STF10003",
        userName: "Engr. Emmanuel Danjuma",
        role: "staff",
        userRef: userMap["e.danjuma@university.edu.ng"]._id,
        readerId: "RD-005",
        door: "Executive Lounge",
        direction: "in",
        result: ACCESS_RESULT.GRANTED,
        timestamp: new Date(now - 6 * hour),
      },
      {
        uid: "STD20003",
        userName: "Fatima Alhassan",
        role: "student",
        userRef: userMap["f.alhassan@university.edu.ng"]._id,
        readerId: "RD-005",
        door: "Executive Lounge",
        direction: "in",
        result: ACCESS_RESULT.DENIED,
        reason: "Unauthorized Zone for Student Role",
        timestamp: new Date(now - 8 * hour),
      },
      {
        uid: "ADM88888",
        userName: "Dr. Babatunde Lawal",
        role: "admin",
        userRef: userMap["admin@university.edu.ng"]._id,
        readerId: "RD-001",
        door: "Main Gate",
        direction: "in",
        result: ACCESS_RESULT.GRANTED,
        timestamp: new Date(now - 12 * hour),
      },
    ];

    const seededLogs = await AccessLog.insertMany(accessLogsToCreate);
    console.log(` Created ${seededLogs.length} Security Audit Log Records.`);

    // ─────────────────────────────────────────────────────────────────────────
    // 6. SEED TEMPORARY ACCESS REQUESTS
    // ─────────────────────────────────────────────────────────────────────────
    console.log(" Seeding Temporary Access Requests...");

    const tempAccessRequestsToCreate = [
      {
        ticketId: "TKT-8849",
        area: "Server Room",
        reason: "Scheduled Emergency Server Maintenance & Hardware Upgrade",
        duration: "2hrs",
        durationLabel: "2 Hours",
        staffId: "STF-1002",
        userRef: userMap["staff2@university.edu.ng"]._id,
        status: "pending",
        submittedAt: new Date(now - 30 * minute),
      },
      {
        ticketId: "TKT-7721",
        area: "CS Research Lab",
        reason: "AI Model Training Session & Dataset Extraction",
        duration: "4hrs",
        durationLabel: "4 Hours",
        staffId: "STD-202401",
        userRef: userMap["student@university.edu.ng"]._id,
        status: "approved",
        submittedAt: new Date(now - 5 * hour),
        reviewedAt: new Date(now - 4 * hour),
        reviewedBy: userMap["admin@university.edu.ng"]._id,
        reviewNotes: "Approved for overnight AI research training.",
        approvedAt: new Date(now - 4 * hour),
        expiresAt: new Date(now + 20 * hour),
      },
      {
        ticketId: "TKT-6610",
        area: "Executive Lounge",
        reason: "Group Study Session",
        duration: "half",
        durationLabel: "Half Day (6 hours)",
        staffId: "STD-202402",
        userRef: userMap["student2@university.edu.ng"]._id,
        status: "rejected",
        submittedAt: new Date(now - 24 * hour),
        reviewedAt: new Date(now - 22 * hour),
        reviewedBy: userMap["admin@university.edu.ng"]._id,
        reviewNotes: "Executive Lounge is restricted to Faculty Staff.",
      },
    ];

    const seededTempAccess = await TemporaryAccess.insertMany(tempAccessRequestsToCreate);
    console.log(` Created ${seededTempAccess.length} Temporary Access Requests.`);

    // ─────────────────────────────────────────────────────────────────────────
    // 7. SUMMARY & PRINT DEMO CREDENTIALS
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n========================================================");
    console.log(" DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("========================================================\n");
    console.log(" DEMO LOGIN CREDENTIALS  & DEMOS:\n");

    console.log("1️⃣ ADMINISTRATOR DEMO ACCOUNT (FULL SYSTEM ACCESS)");
    console.log("   • Email:    admin@university.edu.ng");
    console.log("   • Password: AdminPassword123!");
    console.log("   • Role:     admin (Staff ID: ADM-001)");
    console.log("   • Card UID: ADM88888\n");

    console.log("2️⃣ ACADEMIC STAFF DEMO ACCOUNT 1 (ACTIVE LECTURER)");
    console.log("   • Email:    staff@university.edu.ng");
    console.log("   • Password: StaffPassword123!");
    console.log("   • Role:     staff (Staff ID: STF-1001)");
    console.log("   • Card UID: STF10001\n");

    console.log("3️⃣ ACADEMIC STAFF DEMO ACCOUNT 2 (REPLACED CARD & PENDING TEMP TICKET)");
    console.log("   • Email:    staff2@university.edu.ng");
    console.log("   • Password: StaffPassword123!");
    console.log("   • Role:     staff (Staff ID: STF-1002)");
    console.log("   • Card UID: STF10002\n");

    console.log("4️⃣ STUDENT DEMO ACCOUNT 1 (ACTIVE STUDENT)");
    console.log("   • Email:    student@university.edu.ng");
    console.log("   • Password: StudentPassword123!");
    console.log("   • Role:     student (Staff ID: STD-202401)");
    console.log("   • Card UID: STD20001\n");

    console.log("5️⃣ STUDENT DEMO ACCOUNT 2 (SUSPENDED / LOST CARD TEST)");
    console.log("   • Email:    student2@university.edu.ng");
    console.log("   • Password: StudentPassword123!");
    console.log("   • Role:     student (Staff ID: STD-202402)");
    console.log("   • Card UID: STD20002\n");

    console.log("========================================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Database Error:", error);
    process.exit(1);
  }
};

seedDatabase();
