export const createTicketSchema = (body) => {
  if (!body.eventId || !body.paymentId || !body.ticketType || !body.price) {
    return "eventId, paymentId, ticketType, and price are required fields";
  }
  return null;
};

export default {
  createTicketSchema,
};
