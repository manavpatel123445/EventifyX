import express from "express";
import paymentController from "./controller.js";
import { protect, optionalAuth } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/roleCheck.js";
import { validate } from "../../middlewares/validation.js";
import paymentValidation from "./validation.js";
import verifyStripeWebhook from "../../middlewares/webhookVerification.js";

const router = express.Router();

// Stripe Webhook Endpoint (requires raw body, handled in app.js, validates signature)
// Registered dynamically in app.js or here
router.post("/webhook", express.raw({ type: "application/json" }), verifyStripeWebhook, paymentController.stripeWebhook);

// Public / Optional Authentication: Create Session
router.post("/create-checkout-session", optionalAuth, validate(paymentValidation.createSessionSchema), paymentController.createCheckoutSession);

// Protected: Get tickets
router.get("/tickets", protect, paymentController.getUserTickets);
router.get("/tickets/payment/:paymentId", protect, paymentController.getTicketsByPayment);
router.get("/tickets/session/:sessionId", optionalAuth, paymentController.getTicketsBySession);

// Protected: Manager/Admin logs
router.get("/logs", protect, authorize("event_manager", "admin"), paymentController.getPaymentLogs);

// Admin only: Cleanup
router.post("/cleanup-reservations", protect, authorize("admin"), paymentController.cleanupExpiredReservations);

export default router;
