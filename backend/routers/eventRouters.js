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
  getDateSpecificTickets,
  
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


router.post("/request", protect, createEventRequest);


router.get("/my-requests", protect, getMyEventRequests);


router.get("/managed", protect, authorize("event_manager", "admin"), getMyManagedEvents);


router.get("/managed/requests", protect, authorize("event_manager", "admin"), getRequestsForManagedEvents);

router.put("/:eventId", protect, authorize("event_manager", "admin"), updateEvent);


router.patch("/:eventId/cancel", protect, authorize("event_manager", "admin"), cancelEvent);


router.get("/:eventId/stats", protect, authorize("event_manager", "admin"), getEventStats);


router.get("/admin/requests", protect, authorize("admin"), getAllEventRequests);


router.post("/admin/requests/:requestId/approve", protect, authorize("admin"), approveEventRequest);


router.post("/admin/requests/:requestId/reject", protect, authorize("admin"), rejectEventRequest);


router.patch("/admin/:eventId/soft-delete", protect, authorize("admin"), softDeleteEvent);


router.post("/admin/cleanup-completed", protect, authorize("admin"), autoSoftDeleteCompletedEvents);


router.get("/:eventId/date/:date", getDateSpecificTickets);


router.get("/:identifier", getEventById);

export default router;