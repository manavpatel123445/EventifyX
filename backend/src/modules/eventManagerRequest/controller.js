import eventManagerRequestService from "./service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import STATUS_CODES from "../../constants/statusCodes.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getPagination, formatPaginatedResponse } from "../../utils/pagination.js";

export const submitEventManagerRequest = asyncHandler(async (req, res) => {
  const request = await eventManagerRequestService.submitRequest(req.user.id, req.body);
  res.status(STATUS_CODES.CREATED || 201).json(
    new ApiResponse(STATUS_CODES.CREATED || 201, request, "Manager request submitted successfully")
  );
});

export const getUserRequest = asyncHandler(async (req, res) => {
  const request = await eventManagerRequestService.getUserRequest(req.user.id);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, request, "User manager request fetched successfully"));
});

export const deleteRequest = asyncHandler(async (req, res) => {
  await eventManagerRequestService.deleteRequest(req.params.id, req.user.id);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, null, "Manager request deleted successfully"));
});

export const getAllRequests = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const filters = {};
  if (req.query.status) filters.status = req.query.status;

  const { list, total } = await eventManagerRequestService.listAllRequests(filters, pagination);
  const data = formatPaginatedResponse(list, total, pagination.page, pagination.limit);

  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, data, "All manager requests fetched successfully"));
});

export const approveRequest = asyncHandler(async (req, res) => {
  const request = await eventManagerRequestService.approveRequest(req.params.id, req.user.id, req.body.adminResponse);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, request, "Manager request approved successfully"));
});

export const rejectRequest = asyncHandler(async (req, res) => {
  const request = await eventManagerRequestService.rejectRequest(req.params.id, req.user.id, req.body.adminResponse);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, request, "Manager request rejected successfully"));
});

export default {
  submitEventManagerRequest,
  getUserRequest,
  deleteRequest,
  getAllRequests,
  approveRequest,
  rejectRequest,
};
