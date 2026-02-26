import EventManagerRequest from "../models/EventManagerRequest.js";
import User from "../models/User.js";

// @route   POST /api/manager-requests
// @desc    Submit request to become event manager
// @access  Private (User)
export const submitEventManagerRequest = async (req, res) => {
  try {
    const { reason, experience } = req.body;
    const userId = req.user._id;

    // Check if user already has a pending request
    const existingRequest = await EventManagerRequest.findOne({ 
      user: userId,
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request. Please wait for admin response."
      });
    }

    // Check if user is already an event manager or admin
    if (req.user.role !== "user") {
      return res.status(400).json({
        success: false,
        message: "Only regular users can request to become event managers."
      });
    }

    // Create new request
    const request = await EventManagerRequest.create({
      user: userId,
      reason,
      experience: experience || ""
    });

    res.status(201).json({
      success: true,
      message: "Event manager request submitted successfully",
      data: request
    });

  } catch (error) {
    console.error("Submit request error:", error);
    
    // Handle duplicate key error (user already has request)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already have an active request."
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while submitting request"
    });
  }
};

// @route   GET /api/manager-requests/user
// @desc    Get current user's event manager request
// @access  Private (User)
export const getUserRequest = async (req, res) => {
  try {
    const request = await EventManagerRequest.findOne({ user: req.user._id });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "No request found"
      });
    }

    res.json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error("Get user request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// @route   GET /api/manager-requests
// @desc    Get all event manager requests (Admin only)
// @access  Private (Admin)
export const getAllRequests = async (req, res) => {
  try {
    console.log('GET /api/manager-requests called by:', req.user?.name);
    const { status, page = 1, limit = 10 } = req.query;
    console.log('Query params:', { status, page, limit });
    
    const query = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status;
    }
    console.log('Database query:', query);

    const skip = (page - 1) * limit;
    
    const requests = await EventManagerRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EventManagerRequest.countDocuments(query);
    console.log(`Found ${total} total requests, returning ${requests.length}`);

    res.json({
      success: true,
      data: requests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRequests: total
      }
    });

  } catch (error) {
    console.error("Get all requests error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// @route   PUT /api/manager-requests/:id/approve
// @desc    Approve event manager request
// @access  Private (Admin)
export const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminResponse } = req.body;

    // Find the request
    const request = await EventManagerRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    // Check if already processed
    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Request has already been processed"
      });
    }

    // Update user role to event_manager
    const user = await User.findById(request.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update user role
    user.role = "event_manager";
    await user.save();

    // Update request status
    request.status = "approved";
    request.adminResponse = adminResponse || "Request approved";
    request.processedBy = req.user._id;
    request.processedAt = new Date();
    await request.save();

    res.json({
      success: true,
      message: "Request approved successfully. User promoted to Event Manager.",
      data: request
    });

  } catch (error) {
    console.error("Approve request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// @route   PUT /api/manager-requests/:id/reject
// @desc    Reject event manager request
// @access  Private (Admin)
export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminResponse } = req.body;

    // Find the request
    const request = await EventManagerRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    // Check if already processed
    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Request has already been processed"
      });
    }

    // Update request status
    request.status = "rejected";
    request.adminResponse = adminResponse || "Request rejected";
    request.processedBy = req.user._id;
    request.processedAt = new Date();
    await request.save();

    res.json({
      success: true,
      message: "Request rejected",
      data: request
    });

  } catch (error) {
    console.error("Reject request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// @route   DELETE /api/manager-requests/:id
// @desc    Delete event manager request (User can delete their own pending request)
// @access  Private (User/Admin)
export const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await EventManagerRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    // Only allow user to delete their own pending request, or admin to delete any
    if (req.user.role !== "admin" && request.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Don't allow deletion of processed requests (unless admin)
    if (request.status !== "pending" && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete processed request"
      });
    }

    await EventManagerRequest.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Request deleted successfully"
    });

  } catch (error) {
    console.error("Delete request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
