import paymentService from "./service.js";
import { Payment } from "./model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import STATUS_CODES from "../../constants/statusCodes.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getPagination, formatPaginatedResponse } from "../../utils/pagination.js";
import mongoose from "mongoose";

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const session = await paymentService.checkoutSession(userId, req.body);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, session, "Checkout session created successfully"));
});

export const getUserTickets = asyncHandler(async (req, res) => {
  const Ticket = mongoose.model("Ticket");
  const tickets = await Ticket.find({ user: req.user.id }).populate("event", "title startDate venue images slug");
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, tickets, "User tickets retrieved successfully"));
});

export const getTicketsByPayment = asyncHandler(async (req, res) => {
  const Ticket = mongoose.model("Ticket");
  const tickets = await Ticket.find({ payment: req.params.paymentId }).populate("event", "title startDate venue images slug");
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, tickets, "Tickets fetched successfully"));
});

export const getTicketsBySession = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ stripeSessionId: req.params.sessionId });
  if (!payment) {
    res.status(STATUS_CODES.NOT_FOUND).json(new ApiResponse(STATUS_CODES.NOT_FOUND, null, "Payment not found"));
    return;
  }
  const Ticket = mongoose.model("Ticket");
  const tickets = await Ticket.find({ payment: payment._id }).populate("event", "title startDate venue images slug");
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, tickets, "Tickets fetched successfully"));
});

export const stripeWebhook = asyncHandler(async (req, res) => {
  // Direct integration fallback or using middleware-derived Event object
  const result = await paymentService.handleStripeWebhook(req.stripeEvent || req.body);
  res.status(STATUS_CODES.OK).json(result);
});

export const getPaymentLogs = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { list, total } = await paymentService.listLogs(req.user.role, req.user.id, req.query.status, pagination);
  const data = formatPaginatedResponse(list, total, pagination.page, pagination.limit);

  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, data, "Payment logs fetched successfully"));
});

export const cleanupExpiredReservations = asyncHandler(async (req, res) => {
  const count = await paymentService.cleanupExpiredReservations();
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, { count }, `Cleaned up ${count} expired reservations`));
});

export default {
  createCheckoutSession,
  getUserTickets,
  getTicketsByPayment,
  getTicketsBySession,
  stripeWebhook,
  getPaymentLogs,
  cleanupExpiredReservations,
};
