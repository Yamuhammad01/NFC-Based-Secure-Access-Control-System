const express = require("express");
const router = express.Router();
const scanController = require("../controllers/scanController");

// POST /api/scan — Process QR scan result
router.post("/", scanController.scan);

module.exports = router;