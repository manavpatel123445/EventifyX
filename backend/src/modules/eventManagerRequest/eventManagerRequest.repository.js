import EventManagerRequest from "./eventManagerRequest.model.js";

export class EventManagerRequestRepository {
  async findById(id) {
    return EventManagerRequest.findById(id);
  }

  async findActiveRequestByUser(userId) {
    return EventManagerRequest.findOne({ user: userId });
  }

  async create(data) {
    return EventManagerRequest.create(data);
  }

  async delete(id) {
    return EventManagerRequest.findByIdAndDelete(id);
  }

  async list(filters = {}, pagination = { skip: 0, limit: 10 }) {
    return EventManagerRequest.find(filters)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .sort({ createdAt: -1 });
  }

  async count(filters = {}) {
    return EventManagerRequest.countDocuments(filters);
  }
}

export const eventManagerRequestRepository = new EventManagerRequestRepository();
export default eventManagerRequestRepository;
