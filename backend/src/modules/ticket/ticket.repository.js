import Ticket from "./ticket.model.js";

export class TicketRepository {
  async findById(id) {
    return Ticket.findById(id).populate("event").populate("user", "name email");
  }

  async findByPaymentId(paymentId) {
    return Ticket.find({ payment: paymentId }).populate("event");
  }

  async create(data) {
    return Ticket.create(data);
  }

  async update(id, updateData) {
    return Ticket.findByIdAndUpdate(id, updateData, { new: true });
  }

  async list(filters = {}) {
    return Ticket.find(filters).populate("event");
  }
}

export const ticketRepository = new TicketRepository();
export default ticketRepository;
