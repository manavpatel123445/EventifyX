import express from "express";
import {
  createCheckoutSession,
  getUserTickets,
  getTicketsByPayment,
  getTicketsBySession,
  getPaymentLogs,
  cleanupExpiredReservations,
} from "../controllers/paymentController.js";
import { optionalAuth, protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create Stripe Checkout Session
router.post("/create-checkout-session", optionalAuth, createCheckoutSession);

// Get user's tickets (requires authentication)
router.get("/tickets", protect, getUserTickets);

// Get tickets by payment ID (for success page)
router.get("/tickets/payment/:paymentId", getTicketsByPayment);

// Get tickets by session ID (for success page)
router.get("/tickets/session/:sessionId", optionalAuth, getTicketsBySession);

// Payment logs (manager/admin)
router.get("/logs", protect, authorize("event_manager", "admin"), getPaymentLogs);

// Cleanup expired reservations (admin only)
router.post(
  "/cleanup-reservations",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const cleanedCount = await cleanupExpiredReservations();
      res.json({
        success: true,
        message: `Cleaned up ${cleanedCount} expired reservations`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to cleanup reservations",
      });
    }
  }
);

export default router;
