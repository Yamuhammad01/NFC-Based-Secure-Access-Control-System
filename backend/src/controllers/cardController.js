/**
 * Card Controller
 * Handles NFC card lifecycle: issuance, status changes, replacement.
 */

// POST /api/cards
exports.issueCard = async (req, res) => {
  // TODO: Create card with UID, link to user, set status = active
  res.status(501).json({ message: "issueCard – not implemented" });
};

// GET /api/cards
exports.getAllCards = async (req, res) => {
  // TODO: List all cards with filters (status, user)
  res.status(501).json({ message: "getAllCards – not implemented" });
};

// GET /api/cards/:id
exports.getCardById = async (req, res) => {
  // TODO: Get card details with user population
  res.status(501).json({ message: "getCardById – not implemented" });
};

// PATCH /api/cards/:id/status
exports.updateCardStatus = async (req, res) => {
  // TODO: Update card status (lost, stolen, revoked), add revocation metadata
  res.status(501).json({ message: "updateCardStatus – not implemented" });
};

// POST /api/cards/:id/replace
exports.replaceCard = async (req, res) => {
  // TODO: Mark current card as "replaced", issue new card, update user.activeCard
  res.status(501).json({ message: "replaceCard – not implemented" });
};
