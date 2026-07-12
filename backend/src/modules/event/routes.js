import express from "express";
import eventController from "./controller.js";
import { protect, optionalAuth } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/roleCheck.js";
import { validate } from "../../middlewares/validation.js";
import eventValidation from "./validation.js";

const router = express.Router();

// Public: Get all events
router.get("/", eventController.getAllEvents);

// Protected: Create event request (any authenticated user)
router.post("/request", protect, validate(eventValidation.createRequestSchema), eventController.createEventRequest);

// Protected: Get current user's event requests
router.get("/my-requests", protect, eventController.getMyEventRequests);

// Protected: Event Manager managed events
router.get("/managed", protect, authorize("event_manager", "admin"), eventController.getMyManagedEvents);
router.get("/managed/requests", protect, authorize("event_manager", "admin"), eventController.getRequestsForManagedEvents);

// Protected: Update, Cancel, Stats
router.put("/:eventId", protect, authorize("event_manager", "admin"), validate(eventValidation.updateEventSchema), eventController.updateEvent);
router.patch("/:eventId/cancel", protect, authorize("event_manager", "admin"), eventController.cancelEvent);
router.post("/:eventId/request-cancellation", protect, authorize("event_manager", "admin"), eventController.cancelEvent);
router.get("/:eventId/stats", protect, authorize("event_manager", "admin"), eventController.getEventStats);

// Admin review endpoints
router.get("/admin/requests", protect, authorize("admin"), eventController.getAllEventRequests);
router.post("/admin/requests/:requestId/approve", protect, authorize("admin"), eventController.approveEventRequest);
router.post("/admin/requests/:requestId/reject", protect, authorize("admin"), eventController.rejectEventRequest);
router.patch("/admin/:eventId/soft-delete", protect, authorize("admin"), eventController.softDeleteEvent);
router.post("/admin/cleanup-completed", protect, authorize("admin"), eventController.autoSoftDeleteCompletedEvents);

// Public: Get single event by ID or slug (keep last so it doesn't shadow others)
router.get("/:identifier", eventController.getEventById);

export default router;
