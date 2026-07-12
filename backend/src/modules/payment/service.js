import Stripe from "stripe";
import mongoose from "mongoose";
import paymentRepository from "./repository.js";
import { Payment } from "./model.js";
import ApiError from "../../utils/ApiError.js";
import STATUS_CODES from "../../constants/statusCodes.js";
import config from "../../config/environment.js";

const stripe = new Stripe(config.stripe.secretKey);

export class PaymentService {
  async checkoutSession(userId, { eventId, selectedDate, tickets, currency = "inr" }) {
    const Event = mongoose.model("Event");
    const event = await Event.findById(eventId);
    if (!event) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "Event not found");
    }

    // Verify inventory capacity and reserve
    // Compute total amount
    let totalAmount = 0;
    const lineItems = [];

    for (const requestedTicket of tickets) {
      const pricing = event.ticketPricing.find((t) => t.type === requestedTicket.type);
      if (!pricing) {
        throw new ApiError(STATUS_CODES.BAD_REQUEST, `Invalid ticket type: ${requestedTicket.type}`);
      }

      if (pricing.quantity - pricing.sold < requestedTicket.quantity) {
        throw new ApiError(STATUS_CODES.BAD_REQUEST, `Not enough tickets available for ${requestedTicket.type}`);
      }

      totalAmount += pricing.price * requestedTicket.quantity;

      lineItems.push({
        price_data: {
          currency,
          product_data: {
            name: `${event.title} - ${requestedTicket.type.toUpperCase()}`,
            description: `Event date: ${selectedDate}`,
          },
          unit_amount: Math.round(pricing.price * 100), // Stripe expects cents/paise
        },
        quantity: requestedTicket.quantity,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${config.cors.clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.cors.clientUrl}/events/${event.slug}`,
      metadata: {
        eventId: event._id.toString(),
        userId: userId ? userId.toString() : "",
        selectedDate,
        ticketsJson: JSON.stringify(tickets),
      },
    });

    // Create payment in pending state
    await paymentRepository.create({
      user: userId || null,
      event: event._id,
      stripeSessionId: session.id,
      amount: totalAmount,
      currency,
      status: "pending",
      metadata: {
        selectedDate,
        reservedTickets: tickets,
      },
    });

    return { id: session.id, url: session.url };
  }

  async handleStripeWebhook(event) {
    if (event.type !== "checkout.session.completed") {
      return { received: true };
    }

    // Idempotency lock
    try {
      await paymentRepository.createWebhookEvent(event.id, event.type);
    } catch (error) {
      if (error.code === 11000) {
        console.log("Duplicate webhook received, ignoring:", event.id);
        return { received: true };
      }
      throw error;
    }

    const session = event.data.object;
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      const payment = await Payment.findOne({ stripeSessionId: session.id }).session(dbSession);
      if (!payment) {
        throw new ApiError(STATUS_CODES.NOT_FOUND, "Payment details not found for session");
      }

      if (payment.status === "succeeded") {
        await dbSession.commitTransaction();
        dbSession.endSession();
        return { received: true };
      }

      payment.status = "succeeded";
      payment.stripePaymentIntentId = session.payment_intent;
      await payment.save({ session: dbSession });

      // Build tickets
      const Ticket = mongoose.model("Ticket");
      const Event = mongoose.model("Event");
      const eventDoc = await Event.findById(payment.event).session(dbSession);

      const reservedTickets = payment.metadata?.reservedTickets || [];
      const createdTickets = [];

      for (const reserved of reservedTickets) {
        // Adjust inventory
        const pricing = eventDoc.ticketPricing.find((t) => t.type === reserved.type);
        if (pricing) {
          pricing.sold += reserved.quantity;
        }

        // Create Ticket Doc
        for (let i = 0; i < reserved.quantity; i++) {
          const tDoc = new Ticket({
            user: payment.user || null,
            event: payment.event,
            payment: payment._id,
            ticketType: reserved.type,
            price: pricing ? pricing.price : 0,
            status: "active",
            validForDate: payment.metadata?.selectedDate,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${payment._id}-${reserved.type}-${i}`,
          });
          await tDoc.save({ session: dbSession });
          createdTickets.push(tDoc._id);
        }
      }

      eventDoc.totalBookings += createdTickets.length;
      eventDoc.totalRevenue += payment.amount;
      await eventDoc.save({ session: dbSession });

      payment.tickets = createdTickets;
      await payment.save({ session: dbSession });

      await dbSession.commitTransaction();
      dbSession.endSession();
      return { received: true };
    } catch (error) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      throw error;
    }
  }

  async listLogs(role, userId, status, pagination) {
    const filters = {};
    if (role !== "admin") {
      // Event Manager only sees logs of their events
      const Event = mongoose.model("Event");
      const managed = await Event.find({ eventManager: userId }).select("_id");
      filters.event = { $in: managed.map((e) => e._id) };
    }
    if (status) filters.status = status;

    const list = await paymentRepository.listLogs(filters, pagination);
    const total = await paymentRepository.countLogs(filters);
    return { list, total };
  }

  async cleanupExpiredReservations() {
    // Find pending payments older than 15 minutes and mark failed/cancelled
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const result = await Payment.updateMany(
      {
        status: "pending",
        createdAt: { $lt: fifteenMinsAgo },
      },
      { status: "expired" }
    );
    return result.modifiedCount;
  }
}

export const paymentService = new PaymentService();
export default paymentService;
