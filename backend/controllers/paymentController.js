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
        if (isNaN(effectiveDate.getTime())) throw new Error('Invalid date');
      } catch {
        return res.status(400).json({ message: "Invalid selectedDate" });
      }
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      if (effectiveDate < start || effectiveDate > end) {
        return res.status(404).json({ message: "Date not found for this event" });
      }
    }

    // Build line items
    const line_items = tickets.map((ticket) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: `${(ticket.type || 'regular').toString().toUpperCase()} Ticket - ${event.title}`,
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
          tickets.map(t => ({
            type: (t.type || 'regular').toLowerCase(),
            price: t.price,
            quantity: t.quantity,
          }))
        ),
      },
    });

    // Create a pending Payment record (holds tickets temporarily)
    const amountTotal = tickets.reduce((sum, t) => sum + (Number(t.price) * Number(t.quantity || 1)), 0);

    // Check ticket availability before creating session (date-aware)
    for (const ticket of tickets) {
      const freshEvent = await Event.findById(eventId);
      const ticketType = (ticket.type || 'regular').toLowerCase();

      // If a specific date is provided and event has per-date availability, validate against that
      let availableQuantity;
      let pricingForType = null;

      if (effectiveDate && Array.isArray(freshEvent.eventDates) && freshEvent.eventDates.length > 0) {
        const targetED = freshEvent.eventDates.find(ed => new Date(ed.date).toDateString() === effectiveDate.toDateString());
        if (targetED && Array.isArray(targetED.ticketAvailability) && targetED.ticketAvailability.length > 0) {
          const datePricing = targetED.ticketAvailability.find(t => (t.type || '').toLowerCase() === ticketType);
          if (!datePricing) {
            return res.status(400).json({ message: `Invalid ticket type for selected date: ${ticketType}` });
          }
          pricingForType = datePricing;
          availableQuantity = (datePricing.quantity || 0) - (datePricing.sold || 0);
        }
      }

      // Fallback to global pricing
      if (availableQuantity === undefined) {
        const globalPricing = Array.isArray(freshEvent.ticketPricing)
          ? freshEvent.ticketPricing.find(t => (t.type || '').toLowerCase() === ticketType)
          : null;
        if (!globalPricing) {
          return res.status(400).json({ message: `Invalid ticket type: ${ticketType}` });
        }
        pricingForType = globalPricing;
        availableQuantity = (globalPricing.quantity || 0) - (globalPricing.sold || 0);
      }

      const requestedQuantity = Number(ticket.quantity) || 1;
      if (requestedQuantity > availableQuantity) {
        return res.status(400).json({ message: `Only ${availableQuantity} ${ticketType} tickets available` });
      }
    }

    // Create payment record with reserved status
    const payment = await Payment.create({
      user: req.user?._id,
      event: eventId,
      tickets: [],
      stripeSessionId: session.id,
      amount: amountTotal,
      currency: "inr",
      status: "reserved", // Changed from "pending" to "reserved"
      reservedAt: new Date(),
      metadata: {
        buyerDetails,
        reservedTickets: tickets, // Store what we're reserving
        selectedDate: effectiveDate ? effectiveDate.toISOString() : null
      },
    });

    console.log(`🎫 Payment ${payment._id} reserved for ${tickets.length} ticket types`);

    return res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error?.message || error, error?.stack);
    return res.status(500).json({ message: "Payment session failed" });
  }
};

// Stripe Webhook to handle payment updates
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Mark payment succeeded and create tickets
      const payment = await Payment.findOne({ stripeSessionId: session.id });
      if (payment && payment.status === "reserved") {
        payment.status = "succeeded";
        payment.stripePaymentIntentId = session.payment_intent;
        payment.completedAt = new Date();

        // Update event inventory (permanently remove sold tickets)
        const event = await Event.findById(payment.event);
        const reservedTickets = payment.metadata?.reservedTickets || [];
        const selectedDateISO = payment.metadata?.selectedDate || null;
        // Track which ticket types had their sold counters updated already (per-date or global)
        const updatedTypes = new Set();

        for (const reservedTicket of reservedTickets) {
          const ticketType = reservedTicket.type || 'regular';
          const qty = Number(reservedTicket.quantity) || 1;

          let updated = false;
          // If a selected date exists and event has per-date availability, update that bucket
          if (selectedDateISO && Array.isArray(event.eventDates) && event.eventDates.length > 0) {
            const selectedDate = new Date(selectedDateISO);
            const targetED = event.eventDates.find(ed => new Date(ed.date).toDateString() === selectedDate.toDateString());
            if (targetED && Array.isArray(targetED.ticketAvailability) && targetED.ticketAvailability.length > 0) {
              const datePricing = targetED.ticketAvailability.find(t => (t.type || '').toLowerCase() === ticketType);
              if (datePricing) {
                datePricing.sold = (datePricing.sold || 0) + qty;
                updated = true;
                console.log(`🎫 Sold ${qty} ${ticketType} tickets for date ${selectedDate.toDateString()}`);
              }
            }
          }

          // Fallback to global pricing
          if (!updated) {
            const ticketPricing = Array.isArray(event.ticketPricing)
              ? event.ticketPricing.find(t => (t.type || '').toLowerCase() === ticketType)
              : null;
            if (ticketPricing) {
              ticketPricing.sold = (ticketPricing.sold || 0) + qty;
              console.log(`🎫 Sold ${qty} ${ticketType} tickets (global inventory)`);
            }
          }

          if (updated) {
            updatedTypes.add((ticketType || 'regular').toLowerCase());
          }
        }

        await event.save();
        console.log(`📦 Event ${event._id} inventory updated after successful payment`);

        const createdTickets = [];
        try {
          // Retrieve PaymentIntent to access charges and receipt URL
          const pi = await stripe.paymentIntents.retrieve(session.payment_intent, {
            expand: ["charges"],
          });
          payment.receiptUrl = pi?.charges?.data?.[0]?.receipt_url || payment.receiptUrl;
        } catch (piErr) {
          console.warn("Could not retrieve PaymentIntent charges:", piErr?.message || piErr);
        }

        // Parse tickets metadata
        const ticketsMeta = JSON.parse(session.metadata?.tickets || "[]");
        for (const t of ticketsMeta) {
          for (let i = 0; i < (Number(t.quantity) || 1); i++) {
            // Generate unique ticket ID
            const ticketId = `${payment._id}_${t.type || "regular"}_${i + 1}`;

            // Generate QR code data
            const qrData = {
              ticketId,
              eventId: payment.event.toString(),
              userId: payment.user?.toString(),
              type: t.type || "regular",
              price: Number(t.price) || 0,
              timestamp: new Date().toISOString(),
            };

            // Generate QR code as base64 string
            const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
              width: 200,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              }
            });

            // Ensure all required fields are present
            const ticketData = {
              user: payment.user,
              event: payment.event,
              payment: payment._id,
              type: (t.type || "regular").toLowerCase(),
              price: Number(t.price) || 0,
              status: "active",
              qrCode: qrCodeDataURL,
              seatNumber: `${(t.type || 'regular').toLowerCase()}-${i + 1}`,
              metadata: {
                ticketId, 
                qrData,
                eventId: payment.event.toString(),
                userId: payment.user?.toString(),
                paymentId: payment._id.toString(),
                purchaseDate: new Date().toISOString()
              }
            };

            // Validate ticket data against schema
            const ticketDoc = await Ticket.create(ticketData);
            createdTickets.push(ticketDoc._id);
          }

          // Update Event sold counters if not already updated above, and do it date-aware
          try {
            const qty = Number(t.quantity) || 1;
            if (!inventoryUpdated) {
              if (selectedDateISO) {
                const selectedDate = new Date(selectedDateISO);
                const edIndex = event.eventDates?.findIndex(ed => new Date(ed.date).toDateString() === selectedDate.toDateString()) ?? -1;
                if (edIndex >= 0) {
                  const taIndex = event.eventDates[edIndex].ticketAvailability?.findIndex(ta => ta.type === (t.type || 'regular')) ?? -1;
                  if (taIndex >= 0) {
                    event.eventDates[edIndex].ticketAvailability[taIndex].sold = (event.eventDates[edIndex].ticketAvailability[taIndex].sold || 0) + qty;
                    inventoryUpdated = true;
                  }
                }
              }
              if (!inventoryUpdated) {
                await Event.updateOne(
                  { _id: payment.event, "ticketPricing.type": t.type?.toLowerCase() || "regular" },
                  { 
                    $inc: { 
                      "ticketPricing.$.sold": qty, 
                      totalBookings: qty, 
                      totalRevenue: (Number(t.price) || 0) * qty 
                    } 
                  }
                );
                inventoryUpdated = true;
              }
            }
          } catch (updateErr) {
            console.error("Error updating event ticket counters:", updateErr);
            // Continue processing tickets even if counter update fails
          }
        }

        // Update payment with the created ticket references
        payment.tickets = createdTickets;
        payment.updatedAt = new Date();
        await payment.save();
        
        // Populate the payment with ticket details before saving
        await payment.populate('tickets');
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handling error:", err);
    res.status(500).send("Webhook handler failed");
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
          const createdTickets = [];
          for (const t of ticketsMeta) {
            for (let i = 0; i < (Number(t.quantity) || 1); i++) {
              const ticketId = `${payment._id}_${t.type || "regular"}_${i + 1}`;
              const qrData = { ticketId, eventId: payment.event?.toString(), userId: payment.user?.toString(), type: t.type || 'regular', price: Number(t.price) || 0, timestamp: new Date().toISOString() };
              const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), { width: 200, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } });
              const ticketDoc = await Ticket.create({ user: payment.user, event: payment.event, payment: payment._id, type: t.type || 'regular', price: Number(t.price) || 0, status: 'active', qrCode: qrCodeDataURL, seatNumber: `${t.type || 'regular'}-${i + 1}`, metadata: { ticketId, qrData } });
              createdTickets.push(ticketDoc._id);
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
          payment.tickets = createdTickets.map(t => t._id);
          await payment.save();
          return res.json(createdTickets);
        }
        // Not paid yet
        return res.status(404).json({ message: "No tickets found" });
      } catch (e) {
        return res.status(404).json({ message: "No tickets found" });
      }
    }

    res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets by session:", error);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
};

// Admin/Manager: Get payment logs with real Stripe data
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
      sortBy = 'createdAt',
      sortOrder = 'desc',
      managerOnly
    } = req.query;

    console.log('Search parameters received:', {
      page,
      limit,
      eventId,
      userId,
      transactionId,
      userName,
      eventName,
      status,
      sortBy,
      sortOrder,
      managerOnly
    });

    const filters = {};
    if (eventId) filters.event = eventId;
    if (userId) filters.user = userId;
    if (transactionId) filters.transactionId = transactionId;
    if (status) filters.status = status;

    // If managerOnly, restrict to events of the current manager
    if (managerOnly === 'true' && req.user?.role === 'event_manager') {
      const managerEventIds = await Event.find({ eventManager: req.user._id }).distinct('_id');
      if (filters.event) {
        // If specific eventId provided, ensure it's within manager's events
        filters.event = managerEventIds.includes(filters.event) ? filters.event : null;
      } else {
        filters.event = { $in: managerEventIds };
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Build query with text search if userName or eventName provided
    let query = Payment.find(filters);
    let totalItemsQuery = Payment.find(filters).select('_id');

    // Add text search for user name and event name
    if (userName || eventName) {
      const searchConditions = [];

      if (userName) {
        // Search in populated user name field
        const userSearchQuery = await Payment.find(filters)
          .populate('user', 'name')
          .then(payments => payments.filter(p =>
            p.user?.name && p.user.name.toLowerCase().includes(userName.toLowerCase())
          ));
        if (userSearchQuery.length > 0) {
          searchConditions.push({ _id: { $in: userSearchQuery.map(p => p._id) } });
        }
      }

      if (eventName) {
        // Search in populated event title field
        const eventSearchQuery = await Payment.find(filters)
          .populate('event', 'title')
          .then(payments => payments.filter(p =>
            p.event?.title && p.event.title.toLowerCase().includes(eventName.toLowerCase())
          ));
        if (eventSearchQuery.length > 0) {
          searchConditions.push({ _id: { $in: eventSearchQuery.map(p => p._id) } });
        }
      }

      if (searchConditions.length > 0) {
        query = query.find({ $or: searchConditions });
        totalItemsQuery = totalItemsQuery.find({ $or: searchConditions });
      }
    }

    const totalItems = await totalItemsQuery.countDocuments();
    const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));

    // Fetch payments from database
    const payments = await query
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email')
      .populate('event', 'title')
      .lean();

    console.log('Found payments:', payments.length);
    console.log('Sample transaction IDs:', payments.slice(0, 3).map(p => p.transactionId));
    console.log('Search filters applied:', filters);

    // If searching by transactionId, log more details
    if (transactionId) {
      console.log('Searching for transactionId:', transactionId);
      const matchingPayments = payments.filter(p =>
        p.transactionId && p.transactionId.toLowerCase().includes(transactionId.toLowerCase())
      );
      console.log('Matching payments found:', matchingPayments.length);
    }

    // Fetch real-time data from Stripe for each payment
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        try {
          // If we have a Stripe session ID, fetch real data from Stripe
          if (payment.stripeSessionId) {
            const session = await stripe.checkout.sessions.retrieve(payment.stripeSessionId);

            // Update payment with real Stripe data
            payment.transactionId = session.payment_intent || payment.stripeSessionId;
            payment.status = session.payment_status || payment.status;
            payment.amount = (session.amount_total || 0) / 100; // Convert from cents
            payment.currency = session.currency || payment.currency;

            // If payment is successful, get more details from payment intent
            if (session.payment_intent && session.payment_status === 'paid') {
              try {
                const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
                payment.transactionId = paymentIntent.id;
                payment.status = paymentIntent.status;

                // Get receipt URL if available
                if (paymentIntent.charges && paymentIntent.charges.data.length > 0) {
                  payment.receiptUrl = paymentIntent.charges.data[0].receipt_url;
                }
              } catch (piError) {
                console.warn('Could not fetch payment intent details:', piError?.message || piError);
              }
            }
          }

          return payment;
        } catch (stripeError) {
          console.warn('Could not fetch Stripe data for payment:', payment._id, stripeError?.message || stripeError);
          // Return payment with database data if Stripe fetch fails
          return payment;
        }
      })
    );

    res.json({
      data: enrichedPayments,
      pagination: {
        totalPages,
        currentPage: pageNum,
        totalItems,
        pageSize: limitNum,
      },
    });
  } catch (err) {
    console.error('Error in getPaymentLogs:', err);
    next(err);
  }
};

// Cleanup expired reservations (call this periodically)
export const cleanupExpiredReservations = async () => {
  try {
    const expiredTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

    const expiredPayments = await Payment.find({
      status: "reserved",
      reservedAt: { $lt: expiredTime }
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