import userService from "./service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import STATUS_CODES from "../../constants/statusCodes.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getPagination, formatPaginatedResponse } from "../../utils/pagination.js";

export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserProfile(req.user.id);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, user, "Profile fetched successfully"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateUserProfile(req.user.id, req.body);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, user, "Profile updated successfully"));
});

export const getUsers = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const filters = {};
  if (req.query.role) filters.role = req.query.role;
  if (req.query.status) filters.status = req.query.status;

  const { users, total } = await userService.listUsers(filters, pagination);
  const data = formatPaginatedResponse(users, total, pagination.page, pagination.limit);

  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, data, "Users list retrieved successfully"));
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const user = await userService.updateUserStatus(req.params.id, status);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, user, `User status updated to ${status}`));
});

export default {
  getProfile,
  updateProfile,
  getUsers,
  toggleUserStatus,
};
