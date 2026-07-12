export const createSessionSchema = (body) => {
  if (!body.eventId) {
    return "eventId is required";
  }
  if (!body.selectedDate) {
    return "selectedDate is required";
  }
  if (!body.tickets || !Array.isArray(body.tickets) || body.tickets.length === 0) {
    return "At least one ticket type and quantity is required";
  }
  return null;
};

export default {
  createSessionSchema,
};
