const express = require("express");
const router = express.Router();
const readerController = require("../controllers/readerController");

// POST   /api/readers          — Register a new reader
router.post("/", readerController.createReader);

// GET    /api/readers          — List all readers
router.get("/", readerController.getAllReaders);

// GET    /api/readers/:id      — Get single reader
router.get("/:id", readerController.getReaderById);

// PUT    /api/readers/:id      — Update reader config
router.put("/:id", readerController.updateReader);

// PATCH  /api/readers/:id/status — Toggle reader online/offline
router.patch("/:id/status", readerController.updateReaderStatus);

module.exports = router;
