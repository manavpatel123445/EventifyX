import express from "express";
import {
  getMyManagedEvents,
  getRequestsForManagedEvents,
  updateEvent,
  cancelEvent,
  getEventStats
} from "../controllers/eventController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { apiLimiter, strictLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// All routes require authentication and admin/event_manager role
router.use(protect, authorize("admin", "event_manager"));

// Event Manager routes
router.get("/managed", apiLimiter, getMyManagedEvents);
router.get("/requests/managed", apiLimiter, getRequestsForManagedEvents);
router.put("/:eventId", apiLimiter, updateEvent);
router.delete("/:eventId/cancel", strictLimiter, cancelEvent);
router.get("/:id/stats", apiLimiter, getEventStats);

export default router;
