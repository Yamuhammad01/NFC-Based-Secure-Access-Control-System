const User = require("../models/User");
const { STATUS, ROLES } = require("../config/constants");

// GET /api/users - List all cardholders/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    
    // Map _id to id for frontend compatibility
    const mappedUsers = users.map(u => {
      const obj = u.toObject();
      obj.id = u._id.toString();
      return obj;
    });

    res.status(200).json(mappedUsers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// GET /api/users/:id - Get details of a single user
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Cardholder not found" });
    }
    const userObj = user.toObject();
    userObj.id = user._id.toString();
    res.status(200).json(userObj);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user details", error: error.message });
  }
};

// POST /api/users - Create new cardholder user
exports.createUser = async (req, res) => {
  try {
    const { uid, name, role, accessLevel, allowedTime } = req.body;

    if (!uid || !name) {
      return res.status(400).json({ message: "Card UID and Name are required" });
    }

    // Check if card UID is already registered
    const existingUser = await User.findOne({ uid: uid.toUpperCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: `Card UID ${uid} is already assigned to ${existingUser.name}` });
    }

    const newUser = new User({
      uid: uid.toUpperCase().trim(),
      name,
      role: role || ROLES.STUDENT,
      accessLevel: accessLevel || 1,
      status: STATUS.ACTIVE,
      allowedTime: allowedTime || { start: "08:00", end: "18:00" }
    });

    await newUser.save();

    const userObj = newUser.toObject();
    userObj.id = newUser._id.toString();

    res.status(201).json({
      message: "Cardholder registered successfully",
      user: userObj
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to register cardholder", error: error.message });
  }
};

// PUT /api/users/:id - Update cardholder details
exports.updateUser = async (req, res) => {
  try {
    const { name, role, accessLevel, allowedTime, status } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, accessLevel, allowedTime, status },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Cardholder not found" });
    }

    const userObj = updatedUser.toObject();
    userObj.id = updatedUser._id.toString();

    res.status(200).json({
      message: "Cardholder details updated successfully",
      user: userObj
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update cardholder", error: error.message });
  }
};

// PUT /api/users/:id/lost - Handle lost card (revoke card status)
exports.reportLostCard = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Cardholder not found" });
    }

    user.status = STATUS.REVOKED;
    await user.save();

    res.status(200).json({
      message: `Card for ${user.name} reported lost and successfully revoked.`,
      user
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to report lost card", error: error.message });
  }
};

// PUT /api/users/:id/stolen - Handle stolen card (immediate deactivation)
exports.reportStolenCard = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Cardholder not found" });
    }

    user.status = STATUS.SUSPENDED; // Suspended immediately blocks access
    await user.save();

    res.status(200).json({
      message: `Card for ${user.name} reported stolen and immediately suspended.`,
      user
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to suspend stolen card", error: error.message });
  }
};

// PUT /api/users/:id/replace - Replace card with a new UID and reactivate
exports.replaceCard = async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ message: "New Card UID is required for replacement" });
    }

    const cleanUid = uid.toUpperCase().trim();

    // Check if new UID is already assigned to someone else
    const existingUser = await User.findOne({ uid: cleanUid });
    if (existingUser && existingUser._id.toString() !== req.params.id) {
      return res.status(400).json({ message: `Card UID ${cleanUid} is already active on another user (${existingUser.name})` });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Cardholder not found" });
    }

    // Assign new UID and restore active status
    user.uid = cleanUid;
    user.status = STATUS.ACTIVE;
    await user.save();

    res.status(200).json({
      message: `Replacement card successfully assigned. Account is now active.`,
      user
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to replace card", error: error.message });
  }
};

// DELETE /api/users/:id - Deactivate account (User leaves university)
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Cardholder not found" });
    }

    user.status = STATUS.SUSPENDED; // Account deactivated
    await user.save();

    res.status(200).json({
      message: `Cardholder account for ${user.name} has been deactivated.`,
      user
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to deactivate account", error: error.message });
  }
};
