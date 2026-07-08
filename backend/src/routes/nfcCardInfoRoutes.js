const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/nfcCardInfoController");
const authenticate = require("../middlewares/auth");

// All card management routes require authentication
router.use(authenticate);

// ─── Collection Routes ────────────────────────────────────────────────────────
// GET    /api/cards           — List all NFC cards (with populated user)
router.get("/", ctrl.getAllCards);

// GET    /api/cards/unlinked  — Cards not linked to any user
router.get("/unlinked", ctrl.getUnlinkedCards);

// POST   /api/cards           — Register / issue a new NFC card
router.post("/", ctrl.createCard);

// ─── Single Card Routes ───────────────────────────────────────────────────────
// GET    /api/cards/:id       — Get single card details
router.get("/:id", ctrl.getCardById);

// PUT    /api/cards/:id       — Update card details (name, role, accessLevel, etc.)
router.put("/:id", ctrl.updateCard);

// ─── Card Lifecycle Actions ───────────────────────────────────────────────────
// PUT    /api/cards/:id/replace    — Replace card: old card revoked, new card created
//                                    Body: { uid: "NEW_UID" }
router.put("/:id/replace", ctrl.replaceCard);

// PUT    /api/cards/:id/revoke     — Revoke with reason
//                                    Body: { reason: "lost"|"stolen"|"damaged"|"misuse" }
router.put("/:id/revoke", ctrl.revokeCard);

// PUT    /api/cards/:id/suspend    — Temporarily suspend card access
router.put("/:id/suspend", ctrl.suspendCard);

// PUT    /api/cards/:id/reactivate — Restore a revoked or suspended card to active
router.put("/:id/reactivate", ctrl.reactivateCard);

// PUT    /api/cards/:id/link       — Link card to a user account
//                                    Body: { userRef: "userId" }
router.put("/:id/link", ctrl.linkCardToUser);

// ─── Legacy Routes (backward compatibility) ───────────────────────────────────
// PUT    /api/cards/:id/lost    — Report lost (delegates to revokeCard with reason='lost')
router.put("/:id/lost", ctrl.reportLostCard);

// PUT    /api/cards/:id/stolen  — Report stolen (delegates to suspendCard)
router.put("/:id/stolen", ctrl.reportStolenCard);

// ─── Soft Delete ──────────────────────────────────────────────────────────────
// DELETE /api/cards/:id        — Deactivate/suspend card (soft delete)
router.delete("/:id", ctrl.deactivateCard);

module.exports = router;