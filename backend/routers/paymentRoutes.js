import express from "express";
import { 
  createCheckoutSession, 
  getUserTickets, 
  getTicketsByPayment,
  getTicketsBySession,
} from "../controllers/paymentController.js";
import { optionalAuth, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create Stripe Checkout Session
router.post("/create-checkout-session", optionalAuth, createCheckoutSession);

// Get user's tickets (requires authentication)
router.get("/tickets", protect, getUserTickets);

// Get tickets by payment ID (for success page)
router.get("/tickets/payment/:paymentId", getTicketsByPayment);

// Get tickets by session ID (for success page)
router.get("/tickets/session/:sessionId", getTicketsBySession);

export default router;
