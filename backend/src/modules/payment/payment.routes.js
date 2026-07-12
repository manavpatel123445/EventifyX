import express from "express";
import paymentController from "./payment.controller.js";
import { protect, optionalAuth } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/roleCheck.js";
import { validate } from "../../middlewares/validation.js";
import paymentValidation from "./payment.validation.js";
import verifyStripeWebhook from "../../middlewares/webhookVerification.js";

const router = express.Router();

router.post("/webhook", express.raw({ type: "application/json" }), verifyStripeWebhook, paymentController.stripeWebhook);

router.post("/create-checkout-session", optionalAuth, validate(paymentValidation.createSessionSchema), paymentController.createCheckoutSession);

router.get("/tickets", protect, paymentController.getUserTickets);
router.get("/tickets/payment/:paymentId", protect, paymentController.getTicketsByPayment);
router.get("/tickets/session/:sessionId", optionalAuth, paymentController.getTicketsBySession);

router.get("/logs", protect, authorize("event_manager", "admin"), paymentController.getPaymentLogs);

router.post("/cleanup-reservations", protect, authorize("admin"), paymentController.cleanupExpiredReservations);

export default router;
