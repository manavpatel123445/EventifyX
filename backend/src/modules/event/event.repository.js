import { Event } from "./event.model.js";

export class EventRepository {
  async findById(id) {
    return Event.findById(id).populate("category", "name icon").populate("eventManager", "name email");
  }

  async findBySlug(slug) {
    return Event.findOne({ slug, isDeleted: false })
      .populate("category", "name icon")
      .populate("eventManager", "name email profileImage description");
  }

  async create(data) {
    return Event.create(data);
  }

  async update(id, updateData) {
    return Event.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async softDelete(id) {
    return Event.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  }

  async list(filters = {}, pagination = { skip: 0, limit: 10 }, sort = { startDate: 1 }) {
    const finalFilters = { ...filters, isDeleted: false };
    return Event.find(finalFilters)
      .populate("category", "name icon")
      .populate("eventManager", "name email")
      .skip(pagination.skip)
      .limit(pagination.limit)
      .sort(sort);
  }

  async count(filters = {}) {
    const finalFilters = { ...filters, isDeleted: false };
    return Event.countDocuments(finalFilters);
  }
}

export const eventRepository = new EventRepository();
export default eventRepository;
