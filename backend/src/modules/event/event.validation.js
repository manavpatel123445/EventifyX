export const createRequestSchema = (body) => {
  if (!body.title || body.title.trim().length < 3) {
    return "Event title is required and must be at least 3 characters long";
  }
  if (!body.description || body.description.length < 10) {
    return "Event description is required and must be at least 10 characters long";
  }
  if (!body.category) {
    return "Category is required";
  }
  if (!body.startDate || !body.endDate) {
    return "Start date and End date are required";
  }
  if (!body.startTime || !body.endTime) {
    return "Start time and End time are required";
  }
  if (!body.venue || !body.venue.name || !body.venue.address || !body.venue.city || !body.venue.state || !body.venue.capacity) {
    return "Complete venue information (name, address, city, state, capacity) is required";
  }
  return null;
};

export const updateEventSchema = (body) => {
  if (body.title && body.title.trim().length < 3) {
    return "Event title must be at least 3 characters long";
  }
  if (body.description && body.description.length < 10) {
    return "Event description must be at least 10 characters long";
  }
  return null;
};

export default {
  createRequestSchema,
  updateEventSchema,
};
