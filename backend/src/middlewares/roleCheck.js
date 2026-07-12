import ApiError from "../utils/ApiError.js";
import STATUS_CODES from "../constants/statusCodes.js";

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(STATUS_CODES.UNAUTHORIZED, "Access denied. Authentication required."));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          STATUS_CODES.FORBIDDEN,
          `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
};

export default authorize;
