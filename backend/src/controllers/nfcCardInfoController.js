const mongoose = require("mongoose");
const NfcCardInfo = require("../models/NfcCardInfo");
const Users = require("../models/Users");
const AdminAuditLog = require("../models/AdminAuditLog");
const { STATUS, ROLES } = require("../config/constants");

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Logs an admin audit entry. Silently ignores errors to prevent
 * audit failures from breaking the primary operation.
 */
const auditLog = async (req, action, targetId, details = {}) => {
  try {
    if (!req.user) return;
    await AdminAuditLog.create({
      adminRef: req.user.userId,
      adminName: req.user.email,
      action,
      targetType: "card",
      targetId: targetId.toString(),
      details,
    });
  } catch (_) {
    /* silent — audit must never break card ops */
  }
};

/** Maps a Mongoose card document to a plain object with a top-level `id`. */
const toCardDTO = (doc) => {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = doc._id ? doc._id.toString() : obj._id?.toString();
  return obj;
};

// ─── GET /api/cards ───────────────────────────────────────────────────────────
exports.getAllCards = async (req, res) => {
  try {
    const cards = await NfcCardInfo.find()
      .sort({ createdAt: -1 })
      .populate("userRef", "name firstName lastName email department staffId profilePhoto")
      .populate("issuedBy", "name email")
      .populate("replacedCardRef", "uid");

    res.status(200).json(cards.map(toCardDTO));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cards", error: error.message });
  }
};

// ─── GET /api/cards/unlinked ──────────────────────────────────────────────────
exports.getUnlinkedCards = async (req, res) => {
  try {
    const cards = await NfcCardInfo.find({ userRef: null }).sort({ createdAt: -1 });
    res.status(200).json(cards.map(toCardDTO));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch unlinked cards", error: error.message });
  }
};

// ─── GET /api/cards/:id ───────────────────────────────────────────────────────
exports.getCardById = async (req, res) => {
  try {
    const card = await NfcCardInfo.findById(req.params.id)
      .populate("userRef", "name firstName lastName email department staffId profilePhoto")
      .populate("issuedBy", "name email")
      .populate("replacedCardRef", "uid");

    if (!card) return res.status(404).json({ message: "Card not found" });
    res.status(200).json(toCardDTO(card));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch card details", error: error.message });
  }
};

// ─── POST /api/cards ──────────────────────────────────────────────────────────
exports.createCard = async (req, res) => {
  try {
    const { uid, name, role, accessLevel, allowedTime, userRef } = req.body;

    if (!uid || !name) {
      return res.status(400).json({ message: "Card UID and Name are required" });
    }

    const cleanUid = uid.toUpperCase().trim();

    // Prevent duplicate UID
    const existing = await NfcCardInfo.findOne({ uid: cleanUid });
    if (existing) {
      return res.status(409).json({
        message: `Card UID ${cleanUid} is already assigned to ${existing.name}`,
      });
    }

    // Validate linked user
    if (userRef) {
      const user = await Users.findById(userRef);
      if (!user) return res.status(400).json({ message: "Referenced user not found" });
    }

    const newCard = await NfcCardInfo.create({
      uid: cleanUid,
      name,
      role: role || ROLES.STUDENT,
      accessLevel: accessLevel || 1,
      status: STATUS.ACTIVE,
      allowedTime: allowedTime || { start: "08:00", end: "18:00" },
      userRef: userRef || null,
      issuedBy: req.user?.userId || null,
    });

    // Sync user record
    if (userRef) {
      await Users.findByIdAndUpdate(userRef, {
        uid: cleanUid,
        accessLevel: accessLevel || 1,
      });
    }

    await auditLog(req, "create_card", newCard._id, { uid: cleanUid, name, userRef });

    res.status(201).json({ message: "Card registered successfully", card: toCardDTO(newCard) });
  } catch (error) {
    res.status(500).json({ message: "Failed to register card", error: error.message });
  }
};

// ─── PUT /api/cards/:id ───────────────────────────────────────────────────────
exports.updateCard = async (req, res) => {
  try {
    const { name, role, accessLevel, allowedTime, status } = req.body;

    const card = await NfcCardInfo.findByIdAndUpdate(
      req.params.id,
      { name, role, accessLevel, allowedTime, status },
      { new: true, runValidators: true }
    );

    if (!card) return res.status(404).json({ message: "Card not found" });

    await auditLog(req, "update_card", card._id, { uid: card.uid, changes: req.body });
    res.status(200).json({ message: "Card updated successfully", card: toCardDTO(card) });
  } catch (error) {
    res.status(500).json({ message: "Failed to update card", error: error.message });
  }
};

// ─── PUT /api/cards/:id/revoke ────────────────────────────────────────────────
/**
 * Revoke a card with a mandatory reason.
 * Body: { reason: "lost" | "stolen" | "damaged" | "misuse" }
 */
exports.revokeCard = async (req, res) => {
  try {
    const { reason } = req.body;
    const validReasons = ["lost", "stolen", "damaged", "misuse"];

    if (!reason || !validReasons.includes(reason)) {
      return res.status(400).json({
        message: `A valid revoke reason is required. Accepted: ${validReasons.join(", ")}`,
      });
    }

    const card = await NfcCardInfo.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Card not found" });

    if (card.status === STATUS.REVOKED) {
      return res.status(409).json({ message: "Card is already revoked" });
    }

    card.status = STATUS.REVOKED;
    card.revokeReason = reason;
    card.revokedAt = new Date();
    await card.save();

    await auditLog(req, "revoke_card", card._id, {
      uid: card.uid,
      name: card.name,
      reason,
    });

    res.status(200).json({
      message: `Card for ${card.name} has been revoked (${reason}).`,
      card: toCardDTO(card),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to revoke card", error: error.message });
  }
};

// ─── PUT /api/cards/:id/suspend ───────────────────────────────────────────────
exports.suspendCard = async (req, res) => {
  try {
    const card = await NfcCardInfo.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Card not found" });

    if (card.status === STATUS.SUSPENDED) {
      return res.status(409).json({ message: "Card is already suspended" });
    }

    card.status = STATUS.SUSPENDED;
    card.suspendedAt = new Date();
    await card.save();

    await auditLog(req, "suspend_card", card._id, { uid: card.uid, name: card.name });

    res.status(200).json({
      message: `Card for ${card.name} has been suspended.`,
      card: toCardDTO(card),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to suspend card", error: error.message });
  }
};

// ─── PUT /api/cards/:id/reactivate ────────────────────────────────────────────
exports.reactivateCard = async (req, res) => {
  try {
    const card = await NfcCardInfo.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Card not found" });

    if (card.status === STATUS.ACTIVE) {
      return res.status(409).json({ message: "Card is already active" });
    }

    card.status = STATUS.ACTIVE;
    card.revokeReason = null;
    card.revokedAt = null;
    card.suspendedAt = null;
    card.reactivatedAt = new Date();
    await card.save();

    await auditLog(req, "reactivate_card", card._id, { uid: card.uid, name: card.name });

    res.status(200).json({
      message: `Card for ${card.name} has been reactivated.`,
      card: toCardDTO(card),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to reactivate card", error: error.message });
  }
};

// ─── PUT /api/cards/:id/replace ───────────────────────────────────────────────
/**
 * Replace a card:
 * 1. Revoke the old card (status=revoked, revokeReason='replaced')
 * 2. Create a brand-new NfcCardInfo document for the new UID
 * 3. Update the linked user's uid field
 * 4. Store replacement history on both old and new card records
 * Uses a MongoDB session for atomicity.
 */
exports.replaceCard = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { uid } = req.body;
    if (!uid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "New Card UID is required for replacement" });
    }

    const cleanUid = uid.toUpperCase().trim();

    // Prevent duplicate UID
    const duplicate = await NfcCardInfo.findOne({ uid: cleanUid }).session(session);
    if (duplicate) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        message: `Card UID ${cleanUid} is already registered to ${duplicate.name}`,
      });
    }

    // Find the old card
    const oldCard = await NfcCardInfo.findById(req.params.id).session(session);
    if (!oldCard) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Card not found" });
    }

    const replacedAt = new Date();
    const adminId = req.user?.userId || null;
    const adminEmail = req.user?.email || "";

    const historyEntry = {
      oldUid: oldCard.uid,
      newUid: cleanUid,
      replacedAt,
      replacedBy: adminId,
      replacedByName: adminEmail,
      reason: "replacement",
    };

    // ── Step 1: Revoke the old card ──
    oldCard.status = STATUS.REVOKED;
    oldCard.revokeReason = "replaced";
    oldCard.revokedAt = replacedAt;
    oldCard.replacementHistory.push(historyEntry);
    await oldCard.save({ session });

    // ── Step 2: Create a new card document ──
    const [newCard] = await NfcCardInfo.create(
      [
        {
          uid: cleanUid,
          name: oldCard.name,
          role: oldCard.role,
          accessLevel: oldCard.accessLevel,
          allowedTime: oldCard.allowedTime,
          userRef: oldCard.userRef,
          issuedBy: adminId,
          status: STATUS.ACTIVE,
          isReplacement: true,
          replacedCardRef: oldCard._id,
          replacementHistory: [historyEntry],
        },
      ],
      { session }
    );

    // ── Step 3: Update linked user ──
    if (oldCard.userRef) {
      await Users.findByIdAndUpdate(
        oldCard.userRef,
        { uid: cleanUid },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    await auditLog(req, "replace_card", newCard._id, {
      oldCardId: oldCard._id.toString(),
      oldUid: oldCard.uid,
      newUid: cleanUid,
      name: oldCard.name,
    });

    const populatedNew = await NfcCardInfo.findById(newCard._id)
      .populate("userRef", "name firstName lastName email department staffId profilePhoto")
      .populate("issuedBy", "name email");

    res.status(201).json({
      message: `Replacement card assigned. Old card (${oldCard.uid}) is now revoked.`,
      oldCard: toCardDTO(oldCard),
      newCard: toCardDTO(populatedNew),
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Failed to replace card", error: error.message });
  }
};

// ─── PUT /api/cards/:id/link ──────────────────────────────────────────────────
exports.linkCardToUser = async (req, res) => {
  try {
    const { userRef } = req.body;
    if (!userRef) return res.status(400).json({ message: "User reference is required" });

    const user = await Users.findById(userRef);
    if (!user) return res.status(404).json({ message: "User not found" });

    const card = await NfcCardInfo.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Card not found" });

    // Unlink existing card for this user
    await NfcCardInfo.findOneAndUpdate({ userRef }, { $unset: { userRef: "" } });

    card.userRef = userRef;
    card.name = user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim();
    await card.save();

    user.uid = card.uid;
    user.accessLevel = card.accessLevel;
    await user.save();

    await auditLog(req, "link_card", card._id, { uid: card.uid, userRef, name: card.name });

    res.status(200).json({ message: `Card linked to ${card.name} successfully.`, card: toCardDTO(card) });
  } catch (error) {
    res.status(500).json({ message: "Failed to link card to user", error: error.message });
  }
};

// ─── DELETE /api/cards/:id ────────────────────────────────────────────────────
/** Soft-suspend a card (kept for backward compatibility). */
exports.deactivateCard = async (req, res) => {
  try {
    const card = await NfcCardInfo.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Card not found" });

    card.status = STATUS.SUSPENDED;
    card.suspendedAt = new Date();
    await card.save();

    await auditLog(req, "deactivate_card", card._id, { uid: card.uid, name: card.name });

    res.status(200).json({ message: `Card for ${card.name} has been deactivated.`, card: toCardDTO(card) });
  } catch (error) {
    res.status(500).json({ message: "Failed to deactivate card", error: error.message });
  }
};

// ─── Legacy routes (kept for backward compatibility) ─────────────────────────

exports.reportLostCard = async (req, res) => {
  req.body.reason = "lost";
  return exports.revokeCard(req, res);
};

exports.reportStolenCard = async (req, res) => {
  return exports.suspendCard(req, res);
};