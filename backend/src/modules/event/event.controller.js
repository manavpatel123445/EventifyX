import eventService from "./event.service.js";
import { EventRequest } from "./event.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import STATUS_CODES from "../../constants/statusCodes.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getPagination, formatPaginatedResponse } from "../../utils/pagination.js";

export const createEventRequest = asyncHandler(async (req, res) => {
  const request = await eventService.submitEventRequest(req.user.id, req.body);
  res.status(STATUS_CODES.CREATED || 201).json(
    new ApiResponse(STATUS_CODES.CREATED || 201, request, "Event request submitted successfully! Waiting for admin approval.")
  );
});

export const getMyEventRequests = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const filters = { requestedBy: req.user.id };
  if (req.query.status) filters.status = req.query.status;

  const requests = await EventRequest.find(filters)
    .populate("category", "name")
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort({ createdAt: -1 });

  const total = await EventRequest.countDocuments(filters);
  const data = formatPaginatedResponse(requests, total, pagination.page, pagination.limit);

  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, data, "My event requests fetched successfully"));
});

export const getMyManagedEvents = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { list, total } = await eventService.getMyManagedEvents(req.user.id, req.user.role, req.query.status, pagination);
  const data = formatPaginatedResponse(list, total, pagination.page, pagination.limit);

  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, data, "Managed events retrieved successfully"));
});

export const getRequestsForManagedEvents = asyncHandler(async (req, res) => {
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, { requests: [] }, "Fetched requests for managed events"));
});

export const getAllEvents = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const filters = {};
  if (req.query.category) filters.category = req.query.category;
  if (req.query.status) filters.status = req.query.status;
  if (req.query.city) filters["venue.city"] = new RegExp(req.query.city, "i");
  if (req.query.search) {
    filters.title = new RegExp(req.query.search, "i");
  }

  const { list, total } = await eventService.listEvents(filters, pagination, { startDate: 1 });
  const data = formatPaginatedResponse(list, total, pagination.page, pagination.limit);

  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, data, "Events list retrieved successfully"));
});

export const getEventById = asyncHandler(async (req, res) => {
  const event = await eventService.getEventByIdOrSlug(req.params.identifier);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, event, "Event fetched successfully"));
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(req.params.eventId, req.user.id, req.user.role, req.body);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, event, "Event updated successfully"));
});

export const cancelEvent = asyncHandler(async (req, res) => {
  const event = await eventService.cancelEvent(req.params.eventId, req.user.id, req.user.role);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, event, "Event cancelled successfully"));
});

export const getEventStats = asyncHandler(async (req, res) => {
  const stats = await eventService.getEventStats(req.params.eventId, req.user.id, req.user.role);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, stats, "Event stats fetched successfully"));
});

export const getAllEventRequests = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const filters = {};
  if (req.query.status) filters.status = req.query.status;

  const requests = await EventRequest.find(filters)
    .populate("requestedBy", "name email")
    .populate("category", "name")
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort({ createdAt: -1 });

  const total = await EventRequest.countDocuments(filters);
  const data = formatPaginatedResponse(requests, total, pagination.page, pagination.limit);

  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, data, "All event requests fetched successfully"));
});

export const approveEventRequest = asyncHandler(async (req, res) => {
  const event = await eventService.approveEventRequest(req.params.requestId, req.user.id, req.body.adminNotes);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, event, "Event request approved and event created successfully"));
});

export const rejectEventRequest = asyncHandler(async (req, res) => {
  const request = await eventService.rejectEventRequest(req.params.requestId, req.user.id, req.body.adminNotes);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, request, "Event request rejected successfully"));
});

export const softDeleteEvent = asyncHandler(async (req, res) => {
  const event = await eventService.softDeleteEvent(req.params.eventId, req.query.force);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, event, "Event soft deleted successfully"));
});

export const autoSoftDeleteCompletedEvents = asyncHandler(async (req, res) => {
  const count = await eventService.autoSoftDeleteCompletedEvents();
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, { count }, `${count} completed events have been soft deleted`));
});

export default {
  createEventRequest,
  getMyEventRequests,
  getMyManagedEvents,
  getRequestsForManagedEvents,
  getAllEvents,
  getEventById,
  updateEvent,
  cancelEvent,
  getEventStats,
  getAllEventRequests,
  approveEventRequest,
  rejectEventRequest,
  softDeleteEvent,
  autoSoftDeleteCompletedEvents,
};
