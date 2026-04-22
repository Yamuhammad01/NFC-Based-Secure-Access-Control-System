const express = require("express");
const router = express.Router();
const cardController = require("../controllers/cardController");

// POST   /api/cards            — Issue a new card
router.post("/", cardController.issueCard);

// GET    /api/cards            — List all cards (admin)
router.get("/", cardController.getAllCards);

// GET    /api/cards/:id        — Get single card details
router.get("/:id", cardController.getCardById);

// PATCH  /api/cards/:id/status — Update card status (lost/stolen/revoked)
router.patch("/:id/status", cardController.updateCardStatus);

// POST   /api/cards/:id/replace — Replace a card (issue new, mark old as replaced)
router.post("/:id/replace", cardController.replaceCard);

module.exports = router;
