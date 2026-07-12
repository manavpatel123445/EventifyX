import mongoose from "mongoose";
import eventManagerRequestRepository from "./eventManagerRequest.repository.js";
import ApiError from "../../utils/ApiError.js";
import STATUS_CODES from "../../constants/statusCodes.js";

export class EventManagerRequestService {
  async submitRequest(userId, { reason, experience }) {
    const existing = await eventManagerRequestRepository.findActiveRequestByUser(userId);
    if (existing) {
      if (existing.status === "pending") {
        throw new ApiError(STATUS_CODES.BAD_REQUEST, "You already have a pending manager request");
      }
      if (existing.status === "approved") {
        throw new ApiError(STATUS_CODES.BAD_REQUEST, "You are already approved as a manager");
      }
    }

    return eventManagerRequestRepository.create({
      user: userId,
      reason,
      experience,
    });
  }

  async getUserRequest(userId) {
    const request = await eventManagerRequestRepository.findActiveRequestByUser(userId);
    if (!request) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "No request found for this user");
    }
    return request;
  }

  async deleteRequest(requestId, userId) {
    const request = await eventManagerRequestRepository.findById(requestId);
    if (!request) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "Request not found");
    }

    if (request.user._id.toString() !== userId.toString()) {
      throw new ApiError(STATUS_CODES.FORBIDDEN, "Not authorized to delete this request");
    }

    return eventManagerRequestRepository.delete(requestId);
  }

  async listAllRequests(filters, pagination) {
    const list = await eventManagerRequestRepository.list(filters, pagination);
    const total = await eventManagerRequestRepository.count(filters);
    return { list, total };
  }

  async approveRequest(requestId, adminId, adminResponse) {
    const request = await eventManagerRequestRepository.findById(requestId);
    if (!request) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "Request not found");
    }

    if (request.status !== "pending") {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, `Request is already ${request.status}`);
    }

    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      request.status = "approved";
      request.adminResponse = adminResponse || "Approved by Administrator";
      request.processedBy = adminId;
      request.processedAt = new Date();
      await request.save({ session: dbSession });

      const User = mongoose.model("User");
      const user = await User.findById(request.user._id).session(dbSession);
      if (user) {
        user.role = "event_manager";
        user.becameManagerAt = new Date();
        await user.save({ session: dbSession });
      }

      await dbSession.commitTransaction();
      dbSession.endSession();
      return request;
    } catch (error) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      throw error;
    }
  }

  async rejectRequest(requestId, adminId, adminResponse) {
    const request = await eventManagerRequestRepository.findById(requestId);
    if (!request) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "Request not found");
    }

    if (request.status !== "pending") {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, `Request is already ${request.status}`);
    }

    request.status = "rejected";
    request.adminResponse = adminResponse || "Rejected by Administrator";
    request.processedBy = adminId;
    request.processedAt = new Date();
    return request.save();
  }
}

export const eventManagerRequestService = new EventManagerRequestService();
export default eventManagerRequestService;
