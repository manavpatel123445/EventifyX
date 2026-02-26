import express from "express";
import {
  submitEventManagerRequest,
  getUserRequest,
  getAllRequests,
  approveRequest,
  rejectRequest,
  deleteRequest
} from "../controllers/eventManagerRequestController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User routes (protected)
router.post("/", protect, submitEventManagerRequest);
router.get("/user", protect, getUserRequest);
router.delete("/:id", protect, deleteRequest);

// Admin routes (admin only)
router.get("/", protect, authorize("admin"), getAllRequests);
router.put("/:id/approve", protect, authorize("admin"), approveRequest);
router.put("/:id/reject", protect, authorize("admin"), rejectRequest);

export default router;
