const express = require("express");
const router = express.Router();
const nfcCardInfoController = require("../controllers/nfcCardInfoController");
const authenticate = require("../middlewares/auth");

// All card management routes require authentication
router.use(authenticate);

// GET    /api/cards           — List all NFC cards
router.get("/", nfcCardInfoController.getAllCards);

// GET    /api/cards/unlinked  — Get cards not linked to any user
router.get("/unlinked", nfcCardInfoController.getUnlinkedCards);

// POST   /api/cards           — Register new NFC card
router.post("/", nfcCardInfoController.createCard);

// GET    /api/cards/:id       — Get single card details
router.get("/:id", nfcCardInfoController.getCardById);

// PUT    /api/cards/:id       — Update card details
router.put("/:id", nfcCardInfoController.updateCard);

// PUT    /api/cards/:id/lost  — Mark card as lost (status: revoked)
router.put("/:id/lost", nfcCardInfoController.reportLostCard);

// PUT    /api/cards/:id/stolen — Mark card as stolen (status: suspended)
router.put("/:id/stolen", nfcCardInfoController.reportStolenCard);

// PUT    /api/cards/:id/replace — Assign new card UID and set active
router.put("/:id/replace", nfcCardInfoController.replaceCard);

// PUT    /api/cards/:id/link  — Link card to a user
router.put("/:id/link", nfcCardInfoController.linkCardToUser);

// DELETE /api/cards/:id       — Deactivate/Suspend card
router.delete("/:id", nfcCardInfoController.deactivateCard);

module.exports = router;