import ticketService from "./service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import STATUS_CODES from "../../constants/statusCodes.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const generateTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.generateTicket(req.body);
  res.status(STATUS_CODES.CREATED || 201).json(new ApiResponse(STATUS_CODES.CREATED || 201, ticket, "Ticket generated successfully"));
});

export const verifyTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.verifyTicket(req.params.id);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, ticket, "Ticket verified successfully"));
});

export const useTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.useTicket(req.params.id, req.user.id, req.user.role);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, ticket, "Ticket marked as used successfully"));
});

export default {
  generateTicket,
  verifyTicket,
  useTicket,
};
