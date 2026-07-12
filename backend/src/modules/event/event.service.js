import mongoose from "mongoose";
import eventRepository from "./event.repository.js";
import { EventRequest } from "./event.model.js";
import ApiError from "../../utils/ApiError.js";
import STATUS_CODES from "../../constants/statusCodes.js";

export class EventService {
  async submitEventRequest(requestedBy, requestData) {
    const Category = mongoose.model("Category");
    const categoryExists = await Category.findById(requestData.category);
    if (!categoryExists) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid category selected");
    }

    const eventRequest = new EventRequest({
      ...requestData,
      requestedBy,
    });

    await eventRequest.save();
    return eventRequest.populate([
      { path: "requestedBy", select: "name email" },
      { path: "category", select: "name" },
    ]);
  }

  async listEvents(filters, pagination, sort) {
    const list = await eventRepository.list(filters, pagination, sort);
    const total = await eventRepository.count(filters);
    return { list, total };
  }

  async getEventByIdOrSlug(identifier) {
    let event;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      event = await eventRepository.findById(identifier);
    } else {
      event = await eventRepository.findBySlug(identifier);
    }

    if (!event) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "Event not found");
    }
    return event;
  }

  async updateEvent(eventId, userId, role, updateFields) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "Event not found");
    }

    if (role !== "admin" && event.eventManager._id.toString() !== userId.toString()) {
      throw new ApiError(STATUS_CODES.FORBIDDEN, "Not authorized to update this event");
    }

    const allowedFields = ["title", "description", "startDate", "endDate", "startTime", "endTime", "venue", "ticketPricing", "images", "tags", "isPublic"];
    allowedFields.forEach((field) => {
      if (updateFields[field] !== undefined) {
        event[field] = updateFields[field];
      }
    });

    return event.save();
  }

  async cancelEvent(eventId, userId, role) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "Event not found");
    }

    if (role !== "admin" && event.eventManager._id.toString() !== userId.toString()) {
      throw new ApiError(STATUS_CODES.FORBIDDEN, "Not authorized to cancel this event");
    }

    if (event.status === "cancelled") {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, "Event is already cancelled");
    }

    event.status = "cancelled";
    return event.save();
  }

  async getMyManagedEvents(userId, role, statusFilter, pagination) {
    const filters = {};
    if (role !== "admin") {
      filters.eventManager = userId;
    } else if (statusFilter) {
      filters.status = statusFilter;
    }
    const list = await eventRepository.list(filters, pagination);
    const total = await eventRepository.count(filters);
    return { list, total };
  }

  async getEventStats(eventId, userId, role) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "Event not found");
    }

    if (role !== "admin" && event.eventManager._id.toString() !== userId.toString()) {
      throw new ApiError(STATUS_CODES.FORBIDDEN, "Not authorized to view stats for this event");
    }

    const ticketStats = event.ticketPricing.map((pricing) => ({
      type: pricing.type,
      totalQuantity: pricing.quantity,
      sold: pricing.sold,
      available: pricing.quantity - pricing.sold,
      revenue: pricing.sold * pricing.price,
    }));

    return {
      title: event.title,
      totalBookings: event.totalBookings,
      totalRevenue: event.totalRevenue,
      ticketStats,
    };
  }

  async approveEventRequest(requestId, adminId, notes) {
    const request = await EventRequest.findById(requestId);
    if (!request) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "Event request not found");
    }

    if (request.status !== "pending") {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, `Request is already ${request.status}`);
    }

    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      const EventModel = mongoose.model("Event");
      const event = new EventModel({
        title: request.title,
        description: request.description,
        category: request.category,
        startDate: request.startDate,
        endDate: request.endDate,
        startTime: request.startTime,
        endTime: request.endTime,
        venue: request.venue,
        ticketPricing: request.ticketPricing.map((t) => ({
          type: t.type,
          price: t.price,
          quantity: t.quantity,
          sold: 0,
        })),
        images: request.images,
        tags: request.tags,
        eventManager: request.requestedBy,
        originalRequest: request._id,
        approvedBy: adminId,
        status: "upcoming",
      });

      await event.save({ session: dbSession });

      request.status = "approved";
      request.adminNotes = notes;
      request.reviewedBy = adminId;
      request.reviewedAt = new Date();
      request.approvedEvent = event._id;
      await request.save({ session: dbSession });

      const User = mongoose.model("User");
      const user = await User.findById(request.requestedBy).session(dbSession);
      if (user && user.role === "user") {
        user.role = "event_manager";
        user.becameManagerAt = new Date();
        await user.save({ session: dbSession });
      }

      await dbSession.commitTransaction();
      dbSession.endSession();
      return event;
    } catch (error) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      throw error;
    }
  }

  async rejectEventRequest(requestId, adminId, notes) {
    const request = await EventRequest.findById(requestId);
    if (!request) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "Event request not found");
    }

    if (request.status !== "pending") {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, `Request is already ${request.status}`);
    }

    request.status = "rejected";
    request.adminNotes = notes;
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    await request.save();

    return request;
  }

  async softDeleteEvent(eventId, force) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "Event not found");
    }

    if (force !== "true" && event.status !== "cancelled" && event.status !== "completed") {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, "Only completed or cancelled events can be deleted. Pass force=true to override.");
    }

    if (event.isDeleted) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, "Event is already deleted");
    }

    return eventRepository.softDelete(eventId);
  }

  async autoSoftDeleteCompletedEvents() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const EventModel = mongoose.model("Event");
    const result = await EventModel.updateMany(
      {
        status: "completed",
        endDate: { $lt: thirtyDaysAgo },
        isDeleted: false,
      },
      { isDeleted: true }
    );

    return result.modifiedCount;
  }
}

export const eventService = new EventService();
export default eventService;
