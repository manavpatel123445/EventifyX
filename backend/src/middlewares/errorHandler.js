import STATUS_CODES from "../constants/statusCodes.js";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";
import config from "../config/environment.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // If it's not an instance of ApiError, normalize it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === "ValidationError" ? STATUS_CODES.BAD_REQUEST : STATUS_CODES.INTERNAL_SERVER_ERROR);
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, err.errors || [], err.stack);
  }

  const { statusCode, message, errors, stack } = error;

  // Log error using structured logger
  logger.error(message, {
    statusCode,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    errors,
    stack: config.env === "development" ? stack : undefined,
  });

  const response = {
    success: false,
    message,
    ...(errors.length && { errors }),
    ...(config.env === "development" && { stack }),
  };

  res.status(statusCode).json(response);
};

export default errorHandler;
