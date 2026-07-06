const NfcCardInfo = require("../models/NfcCardInfo");
const Users = require("../models/Users");
const AdminAuditLog = require("../models/AdminAuditLog");
const { STATUS, ROLES } = require("../config/constants");

// GET /api/cards - List all NFC card records
exports.getAllCards = async (req, res) => {
  try {
    const cards = await NfcCardInfo.find().sort({ createdAt: -1 }).populate("userRef", "name firstName lastName email department staffId");
    
    // Map _id to id for frontend compatibility
    const mappedCards = cards.map(c => {
      const obj = c.toObject();
      obj.id = c._id.toString();
      return obj;
    });

    res.status(200).json(mappedCards);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cards", error: error.message });
  }
};

// GET /api/cards/:id - Get details of a single NFC card
exports.getCardById = async (req, res) => {
  try {
    const card = await NfcCardInfo.findById(req.params.id).populate("userRef", "name firstName lastName email department staffId");
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }
    const cardObj = card.toObject();
    cardObj.id = card._id.toString();
    res.status(200).json(cardObj);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch card details", error: error.message });
  }
};

// POST /api/cards - Create new NFC card record
exports.createCard = async (req, res) => {
  try {
    const { uid, name, role, accessLevel, allowedTime, userRef } = req.body;

    if (!uid || !name) {
      return res.status(400).json({ message: "Card UID and Name are required" });
    }

    // Check if card UID is already registered
    const existingCard = await NfcCardInfo.findOne({ uid: uid.toUpperCase().trim() });
    if (existingCard) {
      return res.status(400).json({ message: `Card UID ${uid} is already assigned to ${existingCard.name}` });
    }

    // If userRef provided, validate it exists
    if (userRef) {
      const user = await Users.findById(userRef);
      if (!user) {
        return res.status(400).json({ message: "Referenced user not found" });
      }
    }

    const newCard = new NfcCardInfo({
      uid: uid.toUpperCase().trim(),
      name,
      role: role || ROLES.STUDENT,
      accessLevel: accessLevel || 1,
      status: STATUS.ACTIVE,
      allowedTime: allowedTime || { start: "08:00", end: "18:00" },
      userRef: userRef || null,
      issuedBy: req.user?.userId || null,
    });

    await newCard.save();

    // If userRef provided, update the user's uid field
    if (userRef) {
      await Users.findByIdAndUpdate(userRef, { uid: uid.toUpperCase().trim(), accessLevel: accessLevel || 1 });
    }

    // Log admin audit
    if (req.user) {
      await AdminAuditLog.create({
        adminRef: req.user.userId,
        adminName: req.user.email,
        action: "create_card",
        targetType: "card",
        targetId: newCard._id.toString(),
        details: { uid: newCard.uid, name: newCard.name, userRef },
      });
    }

    const cardObj = newCard.toObject();
    cardObj.id = newCard._id.toString();

    res.status(201).json({
      message: "Card registered successfully",
      card: cardObj
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to register card", error: error.message });
  }
};

// PUT /api/cards/:id - Update card details
exports.updateCard = async (req, res) => {
  try {
    const { name, role, accessLevel, allowedTime, status } = req.body;
    
    const updatedCard = await NfcCardInfo.findByIdAndUpdate(
      req.params.id,
      { name, role, accessLevel, allowedTime, status },
      { new: true }
    );

    if (!updatedCard) {
      return res.status(404).json({ message: "Card not found" });
    }

    const cardObj = updatedCard.toObject();
    cardObj.id = updatedCard._id.toString();

    res.status(200).json({
      message: "Card details updated successfully",
      card: cardObj
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update card", error: error.message });
  }
};

// PUT /api/cards/:id/lost - Handle lost card (revoke card status)
exports.reportLostCard = async (req, res) => {
  try {
    const card = await NfcCardInfo.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    card.status = STATUS.REVOKED;
    await card.save();

    // Log admin audit
    if (req.user) {
      await AdminAuditLog.create({
        adminRef: req.user.userId,
        adminName: req.user.email,
        action: "report_lost",
        targetType: "card",
        targetId: card._id.toString(),
        details: { uid: card.uid, name: card.name },
      });
    }

    res.status(200).json({
      message: `Card for ${card.name} reported lost and successfully revoked.`,
      card
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to report lost card", error: error.message });
  }
};

// PUT /api/cards/:id/stolen - Handle stolen card (immediate deactivation)
exports.reportStolenCard = async (req, res) => {
  try {
    const card = await NfcCardInfo.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    card.status = STATUS.SUSPENDED; // Suspended immediately blocks access
    await card.save();

    // Log admin audit
    if (req.user) {
      await AdminAuditLog.create({
        adminRef: req.user.userId,
        adminName: req.user.email,
        action: "report_stolen",
        targetType: "card",
        targetId: card._id.toString(),
        details: { uid: card.uid, name: card.name },
      });
    }

    res.status(200).json({
      message: `Card for ${card.name} reported stolen and immediately suspended.`,
      card
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to suspend stolen card", error: error.message });
  }
};

// PUT /api/cards/:id/replace - Replace card with a new UID and reactivate
exports.replaceCard = async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ message: "New Card UID is required for replacement" });
    }

    const cleanUid = uid.toUpperCase().trim();

    // Check if new UID is already assigned to someone else
    const existingCard = await NfcCardInfo.findOne({ uid: cleanUid });
    if (existingCard && existingCard._id.toString() !== req.params.id) {
      return res.status(400).json({ message: `Card UID ${cleanUid} is already active on another user (${existingCard.name})` });
    }

    const card = await NfcCardInfo.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    const oldUid = card.uid;

    // Assign new UID and restore active status
    card.uid = cleanUid;
    card.status = STATUS.ACTIVE;
    await card.save();

    // If linked to a user, update their uid field
    if (card.userRef) {
      await Users.findByIdAndUpdate(card.userRef, { uid: cleanUid });
    }

    // Log admin audit
    if (req.user) {
      await AdminAuditLog.create({
        adminRef: req.user.userId,
        adminName: req.user.email,
        action: "replace_card",
        targetType: "card",
        targetId: card._id.toString(),
        details: { oldUid, newUid: cleanUid, name: card.name },
      });
    }

    res.status(200).json({
      message: `Replacement card successfully assigned. Account is now active.`,
      card
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to replace card", error: error.message });
  }
};

// DELETE /api/cards/:id - Deactivate/delete card record
exports.deactivateCard = async (req, res) => {
  try {
    const card = await NfcCardInfo.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    card.status = STATUS.SUSPENDED;
    await card.save();

    // Log admin audit
    if (req.user) {
      await AdminAuditLog.create({
        adminRef: req.user.userId,
        adminName: req.user.email,
        action: "delete_card",
        targetType: "card",
        targetId: card._id.toString(),
        details: { uid: card.uid, name: card.name },
      });
    }

    res.status(200).json({
      message: `Card for ${card.name} has been deactivated.`,
      card
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to deactivate card", error: error.message });
  }
};

// GET /api/cards/unlinked - Get cards not linked to any user
exports.getUnlinkedCards = async (req, res) => {
  try {
    const cards = await NfcCardInfo.find({ userRef: null }).sort({ createdAt: -1 });
    const mappedCards = cards.map(c => {
      const obj = c.toObject();
      obj.id = c._id.toString();
      return obj;
    });
    res.status(200).json(mappedCards);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch unlinked cards", error: error.message });
  }
};

// PUT /api/cards/:id/link - Link card to a user
exports.linkCardToUser = async (req, res) => {
  try {
    const { userRef } = req.body;
    if (!userRef) {
      return res.status(400).json({ message: "User reference is required" });
    }

    const user = await Users.findById(userRef);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const card = await NfcCardInfo.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    // If user already has a card, unlink it
    await NfcCardInfo.findOneAndUpdate({ userRef }, { $unset: { userRef: "" } });

    card.userRef = userRef;
    card.name = user.name;
    await card.save();

    // Update user's uid field
    user.uid = card.uid;
    user.accessLevel = card.accessLevel;
    await user.save();

    res.status(200).json({
      message: `Card linked to ${user.name} successfully.`,
      card
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to link card to user", error: error.message });
  }
};