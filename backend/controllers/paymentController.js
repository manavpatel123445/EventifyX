import dotenv from "dotenv";
dotenv.config();
import Stripe from "stripe";
import QRCode from "qrcode";
import Payment from "../models/payment.js";
import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("Missing STRIPE_SECRET_KEY in environment");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const createCheckoutSession = async (req, res) => {
  try {
    const { eventId, tickets, buyerDetails, selectedDate } = req.body;

    if (!eventId || !Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Resolve and validate selected date (if provided)
    let effectiveDate = null;
    if (selectedDate) {
      try {
        effectiveDate = new Date(selectedDate);
        if (isNaN(effectiveDate.getTime())) throw new Error("Invalid date");
      } catch {
        return res.status(400).json({ message: "Invalid selectedDate" });
      }
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      if (effectiveDate < start || effectiveDate > end) {
        return res.status(404).json({ message: "Date not found for this event" });
      }
    }

    // Check ticket availability before creating session (date-aware)
    // We already have the 'event' object, but let's ensure it's fresh if needed 
    // (though for a single request, the initial fetch is usually fine)
    for (const ticket of tickets) {
      const ticketType = (ticket.type || "regular").toLowerCase();

      // If a specific date is provided and event has per-date availability, validate against that
      let availableQuantity;
      let pricingForType = null;

      if (effectiveDate && Array.isArray(event.eventDates) && event.eventDates.length > 0) {
        const targetED = event.eventDates.find(
          (ed) => new Date(ed.date).toDateString() === effectiveDate.toDateString()
        );
        if (targetED && Array.isArray(targetED.ticketAvailability) && targetED.ticketAvailability.length > 0) {
          const datePricing = targetED.ticketAvailability.find(
            (t) => (t.type || "").toLowerCase() === ticketType
          );
          if (!datePricing) {
            return res
              .status(400)
              .json({ message: `Invalid ticket type for selected date: ${ticketType}` });
          }
          pricingForType = datePricing;
          availableQuantity = (datePricing.quantity || 0) - (datePricing.sold || 0);
        }
      }

      // Fallback to global pricing
      if (availableQuantity === undefined) {
        const globalPricing = Array.isArray(event.ticketPricing)
          ? event.ticketPricing.find(
              (t) => (t.type || "").toLowerCase() === ticketType
            )
          : null;
        if (!globalPricing) {
          return res.status(400).json({ message: `Invalid ticket type: ${ticketType}` });
        }
        pricingForType = globalPricing;
        availableQuantity = (globalPricing.quantity || 0) - (globalPricing.sold || 0);
      }

      const requestedQuantity = Number(ticket.quantity) || 1;
      if (requestedQuantity > availableQuantity) {
        return res
          .status(400)
          .json({ message: `Only ${availableQuantity} ${ticketType} tickets available` });
      }

      // Update the ticket price from the database to ensure accuracy
      ticket.price = pricingForType.price;
    }

    // Build line items
    const line_items = tickets.map((ticket) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: `${(ticket.type || "regular").toString().toUpperCase()} Ticket - ${event.title}`,
        },
        unit_amount: Math.round(Number(ticket.price) * 100),
      },
      quantity: Number(ticket.quantity) || 1,
    }));

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${clientUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/checkout-cancel`,
      customer_email: buyerDetails?.email,
      metadata: {
        eventId,
        buyerName: buyerDetails?.name || "",
        buyerEmail: buyerDetails?.email || "",
        // store a compact representation of tickets for webhook (type normalized)
        tickets: JSON.stringify(
          tickets.map((t) => ({
            type: (t.type || "regular").toLowerCase(),
            price: t.price,
            quantity: t.quantity,
          }))
        ),
      },
    });

    // Create a pending Payment record (holds tickets temporarily)
    const amountTotal = tickets.reduce(
      (sum, t) => sum + Number(t.price) * Number(t.quantity || 1),
      0
    );

    // Create payment record with reserved status
    const payment = await Payment.create({
      user: req.user?._id,
      event: eventId,
      tickets: [],
      stripeSessionId: session.id,
      amount: amountTotal,
      currency: "inr",
      status: "reserved",
      reservedAt: new Date(),
      metadata: {
        buyerDetails,
        reservedTickets: tickets,
        selectedDate: effectiveDate ? effectiveDate.toISOString() : null,
      },
    });

    console.log(`🎫 Payment ${payment._id} reserved for ${tickets.length} ticket types`);

    return res.json({ id: session.id, url: session.url });
  } catch (error) {
    if (error.name === "ValidationError") {
      console.error("Mongoose Validation Error:", error.message);
      return res.status(400).json({ message: "Data validation failed", details: error.message });
    }
    console.error("Stripe session error:", error?.message || error, error?.stack);
    return res.status(500).json({ message: error.message || "Payment session failed" });
  }
};

// Stripe Webhook to handle payment updates
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type !== "checkout.session.completed") {
    return res.json({ received: true });
  }

  const session = event.data.object;
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    console.log("🎉 Webhook received checkout.session.completed for session:", session.id);

    // Mark payment succeeded and create tickets
    const payment = await Payment.findOne({ stripeSessionId: session.id }).session(dbSession);
    if (!payment) {
      console.log("⚠️ Payment not found for session:", session.id);
      await dbSession.abortTransaction();
      return res.status(404).send("Payment not found");
    }

    if (payment.status !== "reserved" && payment.status !== "pending") {
      console.log("⚠️ Payment not in processable state:", payment.status);
      await dbSession.abortTransaction();
      return res.json({ received: true });
    }

    console.log("Processing payment for tickets...");
    payment.status = "succeeded";
    payment.stripePaymentIntentId = session.payment_intent;
    payment.completedAt = new Date();

    // Fetch receipts in background if possible, or just use Stripe session data
    try {
      const pi = await stripe.paymentIntents.retrieve(session.payment_intent, {
        expand: ["charges"],
      });
      payment.receiptUrl = pi?.charges?.data?.[0]?.receipt_url || payment.receiptUrl;
    } catch (piErr) {
      console.warn("Could not retrieve PaymentIntent charges:", piErr.message);
    }

    // Update event inventory
    const eventDoc = await Event.findById(payment.event).session(dbSession);
    const reservedTickets = payment.metadata?.reservedTickets || [];
    const selectedDateISO = payment.metadata?.selectedDate || null;

    for (const reservedTicket of reservedTickets) {
      const ticketType = reservedTicket.type || "regular";
      const qty = Number(reservedTicket.quantity) || 1;
      const price = Number(reservedTicket.price) || 0;

      let updated = false;
      if (selectedDateISO && Array.isArray(eventDoc.eventDates) && eventDoc.eventDates.length > 0) {
        const selectedDate = new Date(selectedDateISO);
        const targetED = eventDoc.eventDates.find(
          (ed) => new Date(ed.date).toDateString() === selectedDate.toDateString()
        );
        if (targetED && Array.isArray(targetED.ticketAvailability) && targetED.ticketAvailability.length > 0) {
          const datePricing = targetED.ticketAvailability.find(
            (t) => (t.type || "").toLowerCase() === ticketType
          );
          if (datePricing) {
            datePricing.sold = (datePricing.sold || 0) + qty;
            updated = true;
          }
        }
      }

      if (!updated) {
        const ticketPricing = Array.isArray(eventDoc.ticketPricing)
          ? eventDoc.ticketPricing.find((t) => (t.type || "").toLowerCase() === ticketType)
          : null;
        if (ticketPricing) {
          ticketPricing.sold = (ticketPricing.sold || 0) + qty;
        }
      }

      eventDoc.totalBookings = (eventDoc.totalBookings || 0) + qty;
      eventDoc.totalRevenue = (eventDoc.totalRevenue || 0) + price * qty;
    }

    await eventDoc.save({ session: dbSession });

    const createdTicketIds = [];
    const ticketsMeta = JSON.parse(session.metadata?.tickets || "[]");
    
    for (const t of ticketsMeta) {
      for (let i = 0; i < (Number(t.quantity) || 1); i++) {
        const ticketId = `${payment._id}_${t.type || "regular"}_${i + 1}`;
        const qrData = {
          ticketId,
          eventId: payment.event.toString(),
          userId: payment.user?.toString(),
          type: t.type || "regular",
          price: Number(t.price) || 0,
          timestamp: new Date().toISOString(),
        };

        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
          width: 200,
          margin: 2,
          color: { dark: "#000000", light: "#FFFFFF" },
        });

        const ticketDoc = await Ticket.create([{
          user: payment.user,
          event: payment.event,
          payment: payment._id,
          type: (t.type || "regular").toLowerCase(),
          price: Number(t.price) || 0,
          status: "active",
          qrCode: qrCodeDataURL,
          seatNumber: `${(t.type || "regular").toLowerCase()}-${i + 1}`,
          metadata: { ticketId, qrData, purchaseDate: new Date().toISOString() },
          eventDate: payment.metadata?.selectedDate ? new Date(payment.metadata.selectedDate) : undefined,
        }], { session: dbSession });
        
        createdTicketIds.push(ticketDoc[0]._id);
      }
    }

    payment.tickets = createdTicketIds;
    await payment.save({ session: dbSession });

    await dbSession.commitTransaction();
    console.log("✅ Webhook transaction committed for payment:", payment._id);
    res.json({ received: true });
  } catch (err) {
    await dbSession.abortTransaction();
    console.error("❌ Webhook transaction aborted:", err);
    res.status(500).send("Webhook handler failed");
  } finally {
    dbSession.endSession();
  }
};

// Get user tickets
export const getUserTickets = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Attempt to claim orphaned tickets/payments that match the user's email
    try {
      if (req.user?.email) {
        const orphanPayments = await Payment.find({
          user: { $in: [null, undefined] },
          $or: [
            { "metadata.buyerDetails.email": req.user.email },
            { "metadata.buyerEmail": req.user.email },
          ],
        });

        for (const pay of orphanPayments) {
          // Attach payment to user
          pay.user = userId;
          await pay.save();

          // Attach tickets to user
          await Ticket.updateMany(
            { payment: pay._id, $or: [{ user: null }, { user: { $exists: false } }] },
            { $set: { user: userId } }
          );
        }
      }
    } catch (claimErr) {
      console.warn("Orphan ticket claim skipped:", claimErr?.message || claimErr);
    }

    const tickets = await Ticket.find({ user: userId })
      .populate('event', 'title startDate endDate venue images')
      .populate('payment', 'amount currency status')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
};

// Get tickets by payment ID (for success page)
export const getTicketsByPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const tickets = await Ticket.find({ payment: paymentId })
      .populate('event', 'title startDate endDate venue images')
      .populate('payment', 'amount currency status')
      .populate('user', 'name email');

    if (tickets.length === 0) {
      return res.status(404).json({ message: "No tickets found" });
    }

    res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets by payment:", error);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
};

// Get tickets by session ID (for success page)
export const getTicketsBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Find payment by session ID
    const payment = await Payment.findOne({ stripeSessionId: sessionId });
    if (!payment) {
      // As a fallback, confirm session from Stripe and create records if needed
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (!session) {
          return res.status(404).json({ message: "Payment not found" });
        }
        // Create payment record if missing
        const newPayment = await Payment.create({
          user: null,
          event: session.metadata?.eventId,
          tickets: [],
          stripeSessionId: session.id,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || "ind",
          status: session.payment_status === 'paid' ? 'succeeded' : 'pending',
          metadata: { buyerDetails: { name: session.metadata?.buyerName, email: session.metadata?.buyerEmail } },
        });
        return res.json([]);
      } catch (e) {
        return res.status(404).json({ message: "Payment not found" });
      }
    }

    // If authenticated user exists and payment has no user, claim it
    try {
      if (req.user?._id && (!payment.user || String(payment.user) === '')) {
        payment.user = req.user._id;
        await payment.save();
        await Ticket.updateMany({ payment: payment._id }, { $set: { user: req.user._id } });
      }
    } catch (claimErr) {
      console.warn("Could not claim session payment to user:", claimErr?.message || claimErr);
    }

    // Get tickets for this payment
    const tickets = await Ticket.find({ payment: payment._id })
      .populate('event', 'title startDate endDate venue images')
      .populate('payment', 'amount currency status')
      .populate('user', 'name email');

    if (tickets.length === 0) {
      // If no tickets yet, check Stripe session status and generate if paid
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session?.payment_status === 'paid') {
          const ticketsMeta = JSON.parse(session.metadata?.tickets || "[]");
          const createdTicketIds = [];
          
          for (const t of ticketsMeta) {
            for (let i = 0; i < (Number(t.quantity) || 1); i++) {
              const ticketId = `${payment._id}_${t.type || "regular"}_${i + 1}`;
              const qrData = { 
                ticketId, 
                eventId: payment.event?.toString(), 
                userId: payment.user?.toString(), 
                type: t.type || 'regular', 
                price: Number(t.price) || 0, 
                timestamp: new Date().toISOString() 
              };
              
              const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), { 
                width: 200, 
                margin: 2, 
                color: { dark: '#000000', light: '#FFFFFF' } 
              });

              const ticketDoc = await Ticket.create({ 
                user: payment.user, 
                event: payment.event, 
                payment: payment._id, 
                type: (t.type || 'regular').toLowerCase(), 
                price: Number(t.price) || 0, 
                status: 'active', 
                qrCode: qrCodeDataURL, 
                seatNumber: `${(t.type || 'regular').toLowerCase()}-${i + 1}`, 
                metadata: { ticketId, qrData } 
              });
              
              createdTicketIds.push(ticketDoc._id);
            }

            // Update Event sold counters and revenue
            await Event.updateOne(
              { _id: payment.event, "ticketPricing.type": t.type || "regular" },
              { $inc: { "ticketPricing.$.sold": Number(t.quantity) || 1, totalBookings: Number(t.quantity) || 1, totalRevenue: (Number(t.price) || 0) * (Number(t.quantity) || 1) } }
            );
          }

          // Mark payment succeeded if not already
          if (payment.status !== 'succeeded') {
            payment.status = 'succeeded';
          }
          payment.tickets = createdTicketIds;
          await payment.save();

          // Fetch fully populated tickets to return to the frontend
          const populatedTickets = await Ticket.find({ _id: { $in: createdTicketIds } })
            .populate('event', 'title startDate endDate venue images')
            .populate('payment', 'amount currency status')
            .populate('user', 'name email');

          return res.json(populatedTickets);
        }
        // Not paid yet
        return res.status(404).json({ message: "No tickets found" });
      } catch (e) {
        console.error("Error in fallback ticket generation:", e);
        return res.status(404).json({ message: "No tickets found" });
      }
    }

    res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets by session:", error);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
};

// Admin/Manager: Get payment logs (Optimized: uses database data only)
export const getPaymentLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      eventId,
      userId,
      transactionId,
      userName,
      eventName,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filters = {};
    if (eventId) filters.event = eventId;
    if (userId) filters.user = userId;
    if (status) filters.status = status;
    if (transactionId) {
      filters.$or = [
        { stripePaymentIntentId: new RegExp(transactionId, "i") },
        { stripeSessionId: new RegExp(transactionId, "i") },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Search by User Name or Event Name using aggregation for efficiency
    let matchStage = { ...filters };
    
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      { $unwind: { path: "$eventDetails", preserveNullAndEmptyArrays: true } },
    ];

    if (userName) {
      const escapedUserName = userName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      pipeline.push({
        $match: { "userDetails.name": new RegExp(escapedUserName, "i") },
      });
    }

    if (eventName) {
      const escapedEventName = eventName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      pipeline.push({
        $match: { "eventDetails.title": new RegExp(escapedEventName, "i") },
      });
    }

    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await Payment.aggregate(totalPipeline);
    const totalItems = totalResult[0]?.total || 0;

    pipeline.push({ $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    const payments = await Payment.aggregate(pipeline);

    res.json({
      data: payments.map(p => ({
        ...p,
        user: p.userDetails ? { _id: p.userDetails._id, name: p.userDetails.name, email: p.userDetails.email } : null,
        event: p.eventDetails ? { _id: p.eventDetails._id, title: p.eventDetails.title } : null,
        transactionId: p.stripePaymentIntentId || p.stripeSessionId
      })),
      pagination: {
        totalPages: Math.ceil(totalItems / limitNum),
        currentPage: pageNum,
        totalItems,
        pageSize: limitNum,
      },
    });
  } catch (err) {
    console.error("Error in getPaymentLogs:", err);
    next(err);
  }
};

export const cleanupExpiredReservations = async () => {
  try {
    const expiredTime = new Date(Date.now() - 30 * 60 * 1000);

    const expiredPayments = await Payment.find({
      status: "reserved",
      reservedAt: { $lt: expiredTime },
    });

    for (const payment of expiredPayments) {
      payment.status = "expired";
      payment.expiredAt = new Date();
      await payment.save();
      console.log(`🧹 Cleaned up expired reservation: ${payment._id}`);
    }

    console.log(`🧹 Cleaned up ${expiredPayments.length} expired reservations`);
    return expiredPayments.length;
  } catch (error) {
    console.error("Error cleaning up expired reservations:", error);
    throw error;
  }
};