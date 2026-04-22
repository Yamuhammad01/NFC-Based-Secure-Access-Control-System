/**
 * Reader Controller
 * Manages NFC reader/device registration and configuration.
 */

// POST /api/readers
exports.createReader = async (req, res) => {
  // TODO: Create reader with readerId, location, zone, allowedRoles, schedule
  res.status(501).json({ message: "createReader – not implemented" });
};

// GET /api/readers
exports.getAllReaders = async (req, res) => {
  // TODO: List all readers with status
  res.status(501).json({ message: "getAllReaders – not implemented" });
};

// GET /api/readers/:id
exports.getReaderById = async (req, res) => {
  // TODO: Get single reader details
  res.status(501).json({ message: "getReaderById – not implemented" });
};

// PUT /api/readers/:id
exports.updateReader = async (req, res) => {
  // TODO: Update reader config (location, allowedRoles, schedule)
  res.status(501).json({ message: "updateReader – not implemented" });
};

// PATCH /api/readers/:id/status
exports.updateReaderStatus = async (req, res) => {
  // TODO: Toggle reader status (online/offline/maintenance)
  res.status(501).json({ message: "updateReaderStatus – not implemented" });
};
