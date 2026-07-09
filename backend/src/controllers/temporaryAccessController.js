const TemporaryAccess = require("../models/TemporaryAccess");
const Users = require("../models/Users");
const { ROLES } = require("../config/constants");

// Helper: Generate unique ticket ID
const generateTicketId = () => {
  return `TAR-${Date.now().toString(36).toUpperCase()}`;
};

// Helper: Calculate expiry time based on duration
const calculateExpiry = (duration) => {
  const now = new Date();
  const expiry = new Date(now);
  
  switch (duration) {
    case "30min":
      expiry.setMinutes(now.getMinutes() + 30);
      break;
    case "1hr":
      expiry.setHours(now.getHours() + 1);
      break;
    case "2hrs":
      expiry.setHours(now.getHours() + 2);
      break;
    case "4hrs":
      expiry.setHours(now.getHours() + 4);
      break;
    case "half":
      expiry.setHours(now.getHours() + 12);
      break;
    case "full":
      expiry.setHours(now.getHours() + 24);
      break;
    default:
      expiry.setHours(now.getHours() + 1);
  }
  
  return expiry;
};

/**
 * POST /api/temp-access/request
 * Submit a new temporary access request
 */
exports.submitRequest = async (req, res) => {
  try {
    const { area, reason, duration } = req.body;
    const userId = req.user?.userId; // From JWT auth middleware

    if (!userId) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    if (!area || !reason || !duration) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: area, reason, duration",
      });
    }

    // Get user details
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    // Create ticket
    const ticketId = generateTicketId();
    
    // Map duration code to label
    const durationLabels = {
      "30min": "30 Minutes",
      "1hr": "1 Hour",
      "2hrs": "2 Hours",
      "4hrs": "4 Hours",
      "half": "Half Day",
      "full": "Full Day",
    };

    const tempAccess = await TemporaryAccess.create({
      ticketId,
      area,
      reason,
      duration,
      durationLabel: durationLabels[duration] || duration,
      staffId: user.staffId || "N/A",
      userRef: userId,
      status: "pending",
    });

    res.status(201).json({
      status: "success",
      message: "Temporary access request submitted successfully",
      data: tempAccess,
    });
  } catch (error) {
    console.error("Error submitting temp access request:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to submit request",
      error: error.message,
    });
  }
};

/**
 * GET /api/temp-access/requests
 * Get all requests for the logged-in user
 */
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const requests = await TemporaryAccess.find({ userRef: userId })
      .sort({ submittedAt: -1 })
      .lean();

    res.status(200).json({
      status: "success",
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch requests",
    });
  }
};

/**
 * GET /api/temp-access/requests/:id
 * Get a single request by ID
 */
exports.getRequestById = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const request = await TemporaryAccess.findById(id);
    
    if (!request) {
      return res.status(404).json({ status: "error", message: "Request not found" });
    }

    // Check if user owns the request or is admin
    const user = await Users.findById(userId);
    const isAdmin = user?.role === ROLES.ADMIN;

    if (request.userRef.toString() !== userId && !isAdmin) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }

    res.status(200).json({
      status: "success",
      data: request,
    });
  } catch (error) {
    console.error("Error fetching request:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch request",
    });
  }
};

/**
 * DELETE /api/temp-access/requests/:id/cancel
 * Cancel a pending request
 */
exports.cancelRequest = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const request = await TemporaryAccess.findById(id);
    
    if (!request) {
      return res.status(404).json({ status: "error", message: "Request not found" });
    }

    if (request.userRef.toString() !== userId) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        status: "error",
        message: "Can only cancel pending requests",
      });
    }

    await TemporaryAccess.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      message: "Request cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling request:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to cancel request",
    });
  }
};

/**
 * PUT /api/temp-access/requests/:id/approve
 * Approve a pending request (Admin only)
 */
exports.approveRequest = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { reviewNotes } = req.body;

    const user = await Users.findById(userId);
    if (!user || user.role !== ROLES.ADMIN) {
      return res.status(403).json({ status: "error", message: "Forbidden - Admin only" });
    }

    const request = await TemporaryAccess.findById(id);
    
    if (!request) {
      return res.status(404).json({ status: "error", message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        status: "error",
        message: "Request has already been processed",
      });
    }

    const now = new Date();
    const expiresAt = calculateExpiry(request.duration);

    request.status = "approved";
    request.reviewedAt = now;
    request.reviewedBy = userId;
    request.reviewNotes = reviewNotes || "Approved";
    request.approvedAt = now;
    request.expiresAt = expiresAt;

    await request.save();

    res.status(200).json({
      status: "success",
      message: "Request approved successfully",
      data: request,
    });
  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to approve request",
    });
  }
};

/**
 * PUT /api/temp-access/requests/:id/reject
 * Reject a pending request (Admin only)
 */
exports.rejectRequest = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { reviewNotes } = req.body;

    const user = await Users.findById(userId);
    if (!user || user.role !== ROLES.ADMIN) {
      return res.status(403).json({ status: "error", message: "Forbidden - Admin only" });
    }

    const request = await TemporaryAccess.findById(id);
    
    if (!request) {
      return res.status(404).json({ status: "error", message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        status: "error",
        message: "Request has already been processed",
      });
    }

    const now = new Date();

    request.status = "rejected";
    request.reviewedAt = now;
    request.reviewedBy = userId;
    request.reviewNotes = reviewNotes || "Rejected";

    await request.save();

    res.status(200).json({
      status: "success",
      message: "Request rejected successfully",
      data: request,
    });
  } catch (error) {
    console.error("Error rejecting request:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to reject request",
    });
  }
};

/**
 * GET /api/temp-access/requests/all
 * Get all requests (Admin only)
 */
exports.getAllRequests = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    const user = await Users.findById(userId);
    if (!user || user.role !== ROLES.ADMIN) {
      return res.status(403).json({ status: "error", message: "Forbidden - Admin only" });
    }

    const requests = await TemporaryAccess.find()
      .sort({ submittedAt: -1 })
      .lean();

    res.status(200).json({
      status: "success",
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching all requests:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch requests",
    });
  }
};