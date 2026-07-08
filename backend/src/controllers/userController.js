const Users = require("../models/Users");
const NfcCardInfo = require("../models/NfcCardInfo");
const AdminAuditLog = require("../models/AdminAuditLog");
const RolePermission = require("../models/RolePermission");
const UserPermission = require("../models/UserPermission");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const ACCESS_AREAS_DEFAULTS = require("../config/roleDefaults");

// Helper to generate temporary password for new users
function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(crypto.randomInt(chars.length));
  }
  return "A" + password.slice(1, -1) + "1!";
}

// Helper to generate a unique random UID of the form NFC- + 7 alphanumeric chars
async function generateUniqueUID() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let uid = "";
  let isUnique = false;

  while (!isUnique) {
    let randomString = "";
    for (let i = 0; i < 7; i++) {
      randomString += chars.charAt(crypto.randomInt(chars.length));
    }
    uid = `NFC-${randomString}`;

    // Check if UID is already in use
    const userWithUid = await Users.findOne({ uid });
    const cardWithUid = await NfcCardInfo.findOne({ uid });
    if (!userWithUid && !cardWithUid) {
      isUnique = true;
    }
  }
  return uid;
}

// GET /api/users - Get all users (supporting search and filter, excluding soft-deleted)
exports.getAllUsers = async (req, res) => {
  try {
    const { search, department, role, cardStatus } = req.query;
    
    // Base query: only get users who are not soft-deleted
    const query = { isDeleted: { $ne: true } };

    // Search query: check Name, Email, or Staff ID
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { staffId: searchRegex }
      ];
    }

    // Filter by department
    if (department) {
      query.department = { $regex: new RegExp(`^${department}$`, "i") };
    }

    // Filter by role
    if (role) {
      query.role = role.toLowerCase();
    }

    // Filter by card status
    if (cardStatus) {
      query.cardStatus = cardStatus.toLowerCase();
    }

    const userList = await Users.find(query)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .sort({ createdAt: -1 });

    const mappedList = userList.map(u => {
      const obj = u.toObject();
      obj.id = u._id.toString();
      return obj;
    });

    res.status(200).json(mappedList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user list", error: error.message });
  }
};

// GET /api/users/:id - Get a single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
      .select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.status(404).json({ message: "User not found or has been deleted" });
    }

    const userObj = user.toObject();
    userObj.id = user._id.toString();
    res.status(200).json(userObj);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user details", error: error.message });
  }
};

// POST /api/users - Register/Create a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, staffId, department, role, uid, accessLevel, profilePhoto } = req.body;
    //console.log(req.body);
    // Check for duplicate email
    const emailLower = email.toLowerCase().trim();
    const existingEmail = await Users.findOne({ email: emailLower, isDeleted: { $ne: true } });
    if (existingEmail) {
      return res.status(400).json({ message: `A user with email ${emailLower} already exists` });
    }

    // Check for duplicate staffId
    const existingStaff = await Users.findOne({ staffId: staffId.trim(), isDeleted: { $ne: true } });
    if (existingStaff) {
      return res.status(400).json({ message: `A user with Staff/Matric ID ${staffId} already exists` });
    }

    // Generate or validate Assigned UID
    let finalUid = "";
    if (uid && uid.trim()) {
      finalUid = uid.toUpperCase().trim();
      const existingUidUser = await Users.findOne({ uid: finalUid, isDeleted: { $ne: true } });
      const existingUidCard = await NfcCardInfo.findOne({ uid: finalUid });
      if (existingUidUser || existingUidCard) {
        return res.status(400).json({ message: `The UID ${finalUid} is already in use by another card/user` });
      }
    } else {
      finalUid = await generateUniqueUID();
    }

    // Generate credentials
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = new Users({
      name: name.trim(),
      email: emailLower,
      password: hashedPassword,
      phone: phone ? phone.trim() : "",
      staffId: staffId.trim(),
      department: department.trim(),
      role: role ? role.toLowerCase() : "staff",
      uid: finalUid,
      accessLevel: accessLevel || 1,
      profilePhoto: profilePhoto || "",
      cardStatus: "active",
      status: "active",
      mustChangePassword: true,
      createdBy: req.user?.userId || null,
    });
     console.log(req.body);
    await newUser.save();

    // Create synchronized NfcCardInfo entry
    const newCard = new NfcCardInfo({
      uid: finalUid,
      name: newUser.name,
      role: newUser.role,
      accessLevel: newUser.accessLevel,
      status: "active",
      userRef: newUser._id,
      issuedBy: req.user?.userId || null,
    });

    await newCard.save();

    // Log admin audit trail
    if (req.user) {
      await AdminAuditLog.create({
        adminRef: req.user.userId,
        adminName: req.user.email,
        action: "create_user",
        targetType: "user",
        targetId: newUser._id.toString(),
        details: { email: newUser.email, staffId: newUser.staffId, uid: newUser.uid },
      });
    }

    const userObj = newUser.toObject();
    delete userObj.password;
    userObj.id = newUser._id.toString();

    res.status(201).json({
      message: "User registered successfully",
      user: userObj,
      tempPassword,
      tempPasswordMessage: `Temporary password generated: ${tempPassword}. The user will be required to change it on their first login.`,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user", error: error.message });
  }
};

// PUT /api/users/:id - Update an existing user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, staffId, department, role, uid, cardStatus, accessLevel, profilePhoto } = req.body;

    const user = await Users.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!user) {
      return res.status(404).json({ message: "User not found or has been deleted" });
    }

    // Check for email collision
    if (email) {
      const emailLower = email.toLowerCase().trim();
      if (emailLower !== user.email) {
        const existingEmail = await Users.findOne({ email: emailLower, _id: { $ne: user._id }, isDeleted: { $ne: true } });
        if (existingEmail) {
          return res.status(400).json({ message: `Email ${emailLower} is already registered to another user` });
        }
        user.email = emailLower;
      }
    }

    // Check for staffId collision
    if (staffId) {
      const staffIdTrimmed = staffId.trim();
      if (staffIdTrimmed !== user.staffId) {
        const existingStaff = await Users.findOne({ staffId: staffIdTrimmed, _id: { $ne: user._id }, isDeleted: { $ne: true } });
        if (existingStaff) {
          return res.status(400).json({ message: `Staff/Matric ID ${staffIdTrimmed} is already registered to another user` });
        }
        user.staffId = staffIdTrimmed;
      }
    }

    // If UID is changed, validate and update cards
    let uidChanged = false;
    let oldUid = user.uid;
    let newUid = "";

    if (uid && uid.trim()) {
      newUid = uid.toUpperCase().trim();
      if (newUid !== oldUid) {
        const existingUidUser = await Users.findOne({ uid: newUid, _id: { $ne: user._id }, isDeleted: { $ne: true } });
        const existingUidCard = await NfcCardInfo.findOne({ uid: newUid, userRef: { $ne: user._id } });
        if (existingUidUser || existingUidCard) {
          return res.status(400).json({ message: `The UID ${newUid} is already in use by another user/card` });
        }
        user.uid = newUid;
        uidChanged = true;
      }
    }

    // Set fields if provided
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone ? phone.trim() : "";
    if (department) user.department = department.trim();
    if (role) user.role = role.toLowerCase();
    if (accessLevel) user.accessLevel = accessLevel;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;

    // Handle Card Status change
    let statusChanged = false;
    if (cardStatus && cardStatus !== user.cardStatus) {
      user.cardStatus = cardStatus.toLowerCase();
      user.status = cardStatus.toLowerCase() === "active" ? "active" : "inactive";
      statusChanged = true;
    }

    await user.save();

    // Synchronize card updates in NfcCardInfo
    if (uidChanged) {
      // 1. Revoke the old card if it existed
      if (oldUid) {
        await NfcCardInfo.findOneAndUpdate(
          { uid: oldUid, userRef: user._id },
          { status: "revoked" }
        );
      }
      
      // 2. See if there is already a card with the new UID, update or create
      const existingCard = await NfcCardInfo.findOne({ uid: newUid });
      if (existingCard) {
        existingCard.userRef = user._id;
        existingCard.name = user.name;
        existingCard.role = user.role;
        existingCard.accessLevel = user.accessLevel;
        existingCard.status = user.cardStatus;
        await existingCard.save();
      } else {
        const newCard = new NfcCardInfo({
          uid: newUid,
          name: user.name,
          role: user.role,
          accessLevel: user.accessLevel,
          status: user.cardStatus,
          userRef: user._id,
          issuedBy: req.user?.userId || null,
        });
        await newCard.save();
      }
    } else {
      // If UID did not change but card status or other fields changed, update the active card details
      if (user.uid) {
        const updateCardFields = {
          name: user.name,
          role: user.role,
          accessLevel: user.accessLevel,
        };
        if (statusChanged) {
          updateCardFields.status = user.cardStatus;
        }
        await NfcCardInfo.findOneAndUpdate(
          { uid: user.uid, userRef: user._id },
          updateCardFields
        );
      }
    }

    // Log admin audit
    if (req.user) {
      await AdminAuditLog.create({
        adminRef: req.user.userId,
        adminName: req.user.email,
        action: "update_user",
        targetType: "user",
        targetId: user._id.toString(),
        details: { email: user.email, staffId: user.staffId, uid: user.uid, cardStatus: user.cardStatus },
      });
    }

    const userObj = user.toObject();
    delete userObj.password;
    userObj.id = user._id.toString();

    res.status(200).json({
      message: "User profile updated successfully",
      user: userObj,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user profile", error: error.message });
  }
};

// DELETE /api/users/:id - Soft delete a user
exports.deleteUser = async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!user) {
      return res.status(404).json({ message: "User not found or already deleted" });
    }

    // Mark user as deleted
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.cardStatus = "inactive";
    user.status = "inactive";
    await user.save();

    // Revoke the user's card in NfcCardInfo
    if (user.uid) {
      await NfcCardInfo.findOneAndUpdate(
        { uid: user.uid, userRef: user._id },
        { status: "revoked" }
      );
    }

    // Log admin audit
    if (req.user) {
      await AdminAuditLog.create({
        adminRef: req.user.userId,
        adminName: req.user.email,
        action: "delete_user",
        targetType: "user",
        targetId: req.params.id,
        details: { email: user.email, staffId: user.staffId, uid: user.uid },
      });
    }

    res.status(200).json({ message: "User deleted successfully (soft delete)" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};
