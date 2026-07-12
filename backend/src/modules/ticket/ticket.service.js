import QRCode from "qrcode";
import ticketRepository from "./ticket.repository.js";
import ApiError from "../../utils/ApiError.js";
import STATUS_CODES from "../../constants/statusCodes.js";

export class TicketService {
  async generateTicket({ eventId, userId, paymentId, ticketType, price, seatNumber }) {
    const ticket = await ticketRepository.create({
      event: eventId,
      user: userId || null,
      payment: paymentId,
      ticketType,
      price,
      status: "active",
      seatNumber,
    });

    const qrData = `ticket:${ticket._id}`;
    const qrCode = await QRCode.toDataURL(qrData);
    ticket.qrCodeUrl = qrCode;
    await ticket.save();

    return ticket;
  }

  async verifyTicket(ticketId) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "Ticket not found");
    }
    return ticket;
  }

  async useTicket(ticketId, userId, role) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "Ticket not found");
    }

    if (ticket.status !== "active") {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, `Ticket is already ${ticket.status}`);
    }

    ticket.status = "used";
    return ticket.save();
  }
}

export const ticketService = new TicketService();
export default ticketService;
