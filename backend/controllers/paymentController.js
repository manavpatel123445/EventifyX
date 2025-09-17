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
    const { eventId, tickets, buyerDetails } = req.body;

    if (!eventId || !Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
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
        // store a compact representation of tickets for webhook
        tickets: JSON.stringify(tickets.map(t => ({ type: t.type || 'regular', price: t.price, quantity: t.quantity }))),
      },
    });

    // Create a pending Payment record
    const amountTotal = tickets.reduce((sum, t) => sum + (Number(t.price) * Number(t.quantity || 1)), 0);
    await Payment.create({
      user: req.user?._id, // optional if auth available
      event: eventId,
      tickets: [],
      stripeSessionId: session.id,
      amount: amountTotal,
      currency: "ind",
        status: "pending",
      metadata: { buyerDetails },
    });

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
      if (payment && payment.status !== "succeeded") {
        payment.status = "succeeded";
        payment.stripePaymentIntentId = session.payment_intent;
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

        const createdTickets = [];
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

            const ticketDoc = await Ticket.create({
              user: payment.user,
              event: payment.event,
              payment: payment._id,
              type: t.type || "regular",
              price: Number(t.price) || 0,
              status: "active",
              qrCode: qrCodeDataURL,
              seatNumber: `${t.type || "regular"}-${i + 1}`,
              metadata: {
                ticketId,
                qrData
              }
            });
            createdTickets.push(ticketDoc._id);
          }

          // Optionally update Event sold counters
          await Event.updateOne(
            { _id: payment.event, "ticketPricing.type": t.type || "regular" },
            { $inc: { "ticketPricing.$.sold": Number(t.quantity) || 1, totalBookings: Number(t.quantity) || 1, totalRevenue: (Number(t.price) || 0) * (Number(t.quantity) || 1) } }
          );
        }

        payment.tickets = createdTickets;
        await payment.save();
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
              createdTickets.push(ticketDoc);
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
