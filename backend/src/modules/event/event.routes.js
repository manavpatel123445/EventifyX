import express from "express";
import eventController from "./event.controller.js";
import { protect, optionalAuth } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/roleCheck.js";
import { validate } from "../../middlewares/validation.js";
import eventValidation from "./event.validation.js";

const router = express.Router();

router.get("/", eventController.getAllEvents);

router.post("/request", protect, validate(eventValidation.createRequestSchema), eventController.createEventRequest);

router.get("/my-requests", protect, eventController.getMyEventRequests);

router.get("/managed", protect, authorize("event_manager", "admin"), eventController.getMyManagedEvents);
router.get("/managed/requests", protect, authorize("event_manager", "admin"), eventController.getRequestsForManagedEvents);

router.put("/:eventId", protect, authorize("event_manager", "admin"), validate(eventValidation.updateEventSchema), eventController.updateEvent);
router.patch("/:eventId/cancel", protect, authorize("event_manager", "admin"), eventController.cancelEvent);
router.post("/:eventId/request-cancellation", protect, authorize("event_manager", "admin"), eventController.cancelEvent);
router.get("/:eventId/stats", protect, authorize("event_manager", "admin"), eventController.getEventStats);

router.get("/admin/requests", protect, authorize("admin"), eventController.getAllEventRequests);
router.post("/admin/requests/:requestId/approve", protect, authorize("admin"), eventController.approveEventRequest);
router.post("/admin/requests/:requestId/reject", protect, authorize("admin"), eventController.rejectEventRequest);
router.patch("/admin/:eventId/soft-delete", protect, authorize("admin"), eventController.softDeleteEvent);
router.post("/admin/cleanup-completed", protect, authorize("admin"), eventController.autoSoftDeleteCompletedEvents);

router.get("/:identifier", eventController.getEventById);

export default router;
