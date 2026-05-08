import express from "express";
import {
  // Event Request Operations
  createEventRequest,
  getAllEventRequests,
  approveEventRequest,
  rejectEventRequest,
  getMyEventRequests,
  
  // Event Operations
  getAllEvents,
  getEventById,
  updateEvent,
  cancelEvent,
  
  // Event Manager Operations
  getMyManagedEvents,
  getEventStats,
  getRequestsForManagedEvents,
  softDeleteEvent,
  autoSoftDeleteCompletedEvents
} from "../controllers/eventController.js";

import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.get("/", getAllEvents);

// =============================================================================
// PROTECTED ROUTES (Authentication required)
// =============================================================================

// Create event request (any authenticated user)
// POST /api/events/request
router.post("/request", protect, createEventRequest);

// Get current user's event requests
// GET /api/events/my-requests?status=pending&page=1&limit=10
router.get("/my-requests", protect, getMyEventRequests);

// =============================================================================
// EVENT MANAGER ROUTES (event_manager role required)
// =============================================================================

// Get events managed by current user
// GET /api/events/managed?status=upcoming&page=1&limit=10
router.get("/managed", protect, authorize("event_manager", "admin"), getMyManagedEvents);

// Get event requests for events managed by current user (event_manager)
router.get("/managed/requests", protect, authorize("event_manager", "admin"), getRequestsForManagedEvents);

// Update event (only event manager of that event)
// PUT /api/events/:eventId
router.put("/:eventId", protect, authorize("event_manager", "admin"), updateEvent);

// Cancel event (only event manager of that event)
// PATCH /api/events/:eventId/cancel
router.patch("/:eventId/cancel", protect, authorize("event_manager", "admin"), cancelEvent);

// Request event cancellation (Frontend alias)
// POST /api/events/:eventId/request-cancellation
router.post("/:eventId/request-cancellation", protect, authorize("event_manager", "admin"), cancelEvent);

// Get event statistics (only event manager of that event)
// GET /api/events/:eventId/stats
router.get("/:eventId/stats", protect, authorize("event_manager", "admin"), getEventStats);

// =============================================================================
// ADMIN ROUTES (admin role required)
// =============================================================================

// Get all event requests for admin review
// GET /api/events/admin/requests?status=pending&page=1&limit=10
router.get("/admin/requests", protect, authorize("admin"), getAllEventRequests);

// Approve event request (creates event and promotes user to event_manager)
// POST /api/events/admin/requests/:requestId/approve
router.post("/admin/requests/:requestId/approve", protect, authorize("admin"), approveEventRequest);

// Reject event request
// POST /api/events/admin/requests/:requestId/reject
router.post("/admin/requests/:requestId/reject", protect, authorize("admin"), rejectEventRequest);

// Soft delete an event (Admin only)
// PATCH /api/events/admin/:eventId/soft-delete
router.patch("/admin/:eventId/soft-delete", protect, authorize("admin"), softDeleteEvent);

// Auto soft delete completed events (Admin only)
// POST /api/events/admin/cleanup-completed
router.post("/admin/cleanup-completed", protect, authorize("admin"), autoSoftDeleteCompletedEvents);

// =============================================================================
// PUBLIC: Get single event by ID or slug (keep LAST so it doesn't shadow others)
// =============================================================================
// GET /api/events/6743ab123456789 or GET /api/events/music-concert-2024
router.get("/:identifier", getEventById);

export default router;