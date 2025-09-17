import QRCode from "qrcode";
import Ticket from "../models/Ticket.js";

export const createTicket = async (req, res) => {
  try {
    const { eventId, userId, tickets, totalAmount, paymentId } = req.body;

    // Create booking record
    const ticket = new Ticket({
      event: eventId,
      user: userId,
      tickets,
      totalAmount,
      paymentId,
    });

    // Generate QR Code with ticket ID
    const qrData = `ticket:${ticket._id}`;
    const qrCode = await QRCode.toDataURL(qrData);

    ticket.qrCode = qrCode;
    await ticket.save();

    res.status(201).json({ success: true, ticket });
  } catch (err) {
    console.error("Create ticket error:", err);
    res.status(500).json({ success: false, message: "Failed to create ticket" });
  }
};
