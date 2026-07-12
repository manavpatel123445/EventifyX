import authService from "./service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import STATUS_CODES from "../../constants/statusCodes.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const data = await authService.registerUser(req.body);
  res.status(STATUS_CODES.CREATED || 201).json(new ApiResponse(STATUS_CODES.CREATED || 201, data, "User registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const data = await authService.loginUser(req.body);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, data, "Logged in successfully"));
});

export const refresh = asyncHandler(async (req, res) => {
  const data = await authService.refreshAccessToken(req.body.refreshToken);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, data, "Access token refreshed successfully"));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const message = await authService.sendForgotPasswordEmail(req.body.email);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, null, message));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const message = await authService.resetUserPassword(req.params.resettoken, req.body.password);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, null, message));
});

export const getMe = asyncHandler(async (req, res) => {
  // User is already attached to req.user by protect middleware
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, req.user, "Current user fetched successfully"));
});

export default {
  register,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  getMe,
};
