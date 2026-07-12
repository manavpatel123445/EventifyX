import { Payment, StripeWebhookEvent } from "./model.js";

export class PaymentRepository {
  async findById(id) {
    return Payment.findById(id).populate("event").populate("user", "name email");
  }

  async findBySessionId(sessionId) {
    return Payment.findOne({ stripeSessionId: sessionId }).populate("event");
  }

  async findByUser(userId) {
    return Payment.find({ user: userId }).sort({ createdAt: -1 });
  }

  async create(data) {
    return Payment.create(data);
  }

  async update(id, updateData) {
    return Payment.findByIdAndUpdate(id, updateData, { new: true });
  }

  async createWebhookEvent(eventId, eventType) {
    return StripeWebhookEvent.create({
      stripeEventId: eventId,
      eventType,
    });
  }

  async findWebhookEvent(eventId) {
    return StripeWebhookEvent.findOne({ stripeEventId: eventId });
  }

  async listLogs(filters = {}, pagination = { skip: 0, limit: 10 }) {
    return Payment.find(filters)
      .populate("user", "name email")
      .populate("event", "title")
      .skip(pagination.skip)
      .limit(pagination.limit)
      .sort({ createdAt: -1 });
  }

  async countLogs(filters = {}) {
    return Payment.countDocuments(filters);
  }
}

export const paymentRepository = new PaymentRepository();
export default paymentRepository;
