const express = require("express");
const router = express.Router();
const temporaryAccessController = require("../controllers/temporaryAccessController");
const authMiddleware = require("../middlewares/auth");

// All routes require authentication
router.use(authMiddleware);

// POST /api/temp-access/request - Submit new request
router.post("/request", temporaryAccessController.submitRequest);

// GET /api/temp-access/requests - Get my requests
router.get("/requests", temporaryAccessController.getMyRequests);

// GET /api/temp-access/requests/:id - Get request by ID
router.get("/requests/:id", temporaryAccessController.getRequestById);

// DELETE /api/temp-access/requests/:id/cancel - Cancel pending request
router.delete("/requests/:id/cancel", temporaryAccessController.cancelRequest);

// PUT /api/temp-access/requests/:id/approve - Approve request (admin only)
router.put("/requests/:id/approve", temporaryAccessController.approveRequest);

// PUT /api/temp-access/requests/:id/reject - Reject request (admin only)
router.put("/requests/:id/reject", temporaryAccessController.rejectRequest);

// GET /api/temp-access/requests/all - Get all requests (admin only)
router.get("/requests/all", temporaryAccessController.getAllRequests);

module.exports = router;